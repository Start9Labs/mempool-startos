import { sdk } from './sdk'
import {
  apiPort,
  btcMountpoint,
  clnMountpoint,
  dbPort,
  determineSyncResponse,
  IbdStateRes,
  lndMountpoint,
  nginxConf,
  TxIndexRes,
  uiPort,
} from './utils'
import { readFile, writeFile } from 'fs/promises'
import { bitcoinConfDefaults } from 'bitcoind-startos/startos/utils'
import { configJson } from './file-models/mempool-config.json'

/**
 * ======================== Mounts ========================
 */
let backendMounts = sdk.Mounts.of()
  .mountVolume({
    volumeId: 'backend',
    subpath: null,
    mountpoint: '/backend/cache',
    readonly: false,
  })
  .mountDependency({
    dependencyId: 'bitcoind',
    volumeId: 'main',
    subpath: null,
    mountpoint: btcMountpoint,
    // @TODO: this should be readonly, but we need to change its permissions
    readonly: false,
  })

export const main = sdk.setupMain(async ({ effects, started }) => {
  /**
   * ======================== Setup ========================
   */
  console.info('Starting Mempool...')

  // ========================
  // Dependency setup & checks
  // ========================

  const depResult = await sdk.checkDependencies(effects)
  depResult.throwIfNotSatisfied()

  const config = await configJson.read().const(effects)
  if (!config) throw new Error('Config file not found')

  if (config.LIGHTNING.ENABLED) {
    switch (config.LIGHTNING.BACKEND) {
      case 'lnd':
        // @TODO backendMounts.mountDependency<typeof LndManifest>
        backendMounts = backendMounts.mountDependency({
          dependencyId: 'lnd',
          volumeId: 'main', //@TODO verify
          subpath: null,
          mountpoint: lndMountpoint,
          readonly: true,
        })
        break
      case 'c-lightning':
        // @TODO backendMounts.mountDependency<typeof ClnManifest>
        backendMounts = backendMounts.mountDependency({
          dependencyId: 'c-lightning',
          volumeId: 'main', //@TODO verify
          subpath: null,
          mountpoint: clnMountpoint,
          readonly: true,
        })
        break
      default:
        break
    }
  }

  // ========================
  // Set containers
  // ========================

  const backendContainer = await sdk.SubContainer.of(
    effects,
    { imageId: 'backend' },
    backendMounts,
    'backend-api',
  )

  const frontendContainer = await sdk.SubContainer.of(
    effects,
    { imageId: 'frontend' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'frontend',
      subpath: null,
      mountpoint: '/root',
      readonly: false,
    }),
    'user-interface',
  )

  // ========================
  // Setup Nginx
  // ========================
  await writeFile(
    `${frontendContainer.rootfs}/etc/nginx/conf.d/default.conf`,
    nginxConf,
  )

  // ========================
  // Additional health check(s)
  // ========================

  const syncHealthCheck = {
    display: 'Transaction Indexer',
    fn: async () => {
      const auth = await readFile(
        `${backendContainer.rootfs}${btcMountpoint}/${bitcoinConfDefaults.rpccookiefile}`,
        {
          encoding: 'base64',
        },
      )
      const txIndexReq = fetch('http://bitcoind.startos:8332', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          jsonrpc: '1.0',
          id: 'sync-hck',
          method: 'getindexinfo',
          params: ['txindex'],
        }),
      })
        .then(async (res: any) => {
          const jsonRes = (await res.json()) as TxIndexRes
          // @TODO remove me after testing
          console.log(`Tx index response is: ${res}`)
          console.log(`Tx index response parsed as json: ${jsonRes}`)
          return jsonRes
        })
        .catch((e: any) => {
          throw new Error(e)
        })

      const ibdStateReq = fetch('http://bitcoind.startos:8332', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          jsonrpc: '1.0',
          id: 'sync-hck',
          method: 'getblockchaininfo',
          params: [],
        }),
      })
        .then(async (res: any) => {
          const jsonRes = (await res.json()) as IbdStateRes
          // @TODO remove me after testing
          console.log(`IBD response is: ${res}`)
          console.log(`IBD response parsed as json: ${jsonRes}`)
          return jsonRes
        })
        .catch((e: any) => {
          throw new Error(e)
        })

      const [txIndexRes, ibdStateRes] = await Promise.all([
        txIndexReq,
        ibdStateReq,
      ])
      return determineSyncResponse(txIndexRes, ibdStateRes)
    },
  }

  /**
   *  ======================== Daemons ========================
   */
  return sdk.Daemons.of(effects, started)
    .addDaemon('mariadb', {
      subcontainer: await sdk.SubContainer.of(
        effects,
        { imageId: 'mariadb' },
        sdk.Mounts.of().mountVolume({
          volumeId: 'mariadb',
          subpath: null,
          mountpoint: '/var/lib/mysql',
          readonly: false,
        }),
        'database',
      ),
      exec: {
        command: [
          '/usr/bin/mysqld_safe',
          '--user=mysql',
          "--datadir='/var/lib/mysql",
        ],
        env: {
          MYSQL_DATABASE: 'mempool',
          MYSQL_USER: 'mempool',
          MYSQL_PASSWORD: 'mempool',
          MYSQL_ROOT_PASSWORD: 'admin',
        },
      },
      ready: {
        display: 'Database',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, dbPort, {
            successMessage: 'The database is ready',
            errorMessage: 'The database is not ready',
          }),
      },
      requires: [],
    })
    .addDaemon('api', {
      subcontainer: backendContainer,
      exec: {
        command: [
          '/backend/wait-for-it.sh',
          `localhost:${dbPort}`,
          '--timeout=720',
          '--strict',
          '-- ./start.sh',
        ],
      },
      ready: {
        display: 'API',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, apiPort, {
            successMessage: 'The API is ready',
            errorMessage: 'The API is not ready',
          }),
      },
      requires: ['mariadb'],
    })
    .addHealthCheck('sync', { ready: syncHealthCheck, requires: ['api'] })
    .addDaemon('webui', {
      subcontainer: frontendContainer,
      exec: {
        command: ['nginx', '-g', "'daemon off;'"],
      },
      ready: {
        display: 'Web Interface',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: 'The web interface is ready',
            errorMessage: 'The web interface is not ready',
          }),
      },
      requires: ['api'],
    })
})
