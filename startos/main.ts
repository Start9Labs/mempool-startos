import { sdk } from './sdk'
import {
  apiPort,
  btcMountpoint,
  clnMountpoint,
  dbPort,
  determineSyncResponse,
  IbdStateRes,
  lndMountpoint,
  TxIndexRes,
  uiPort,
} from './utils'
import { readFile } from 'fs/promises'
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
        backendMounts = backendMounts.mountDependency({
          dependencyId: 'lnd',
          volumeId: 'main',
          subpath: null,
          mountpoint: lndMountpoint,
          readonly: true,
        })
        break
      case 'cln':
        backendMounts = backendMounts.mountDependency({
          dependencyId: 'c-lightning',
          volumeId: 'main',
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
  // Additional health check(s)
  // ========================

  const syncHealthCheck = {
    display: 'Transaction Indexer',
    fn: async () => {
      const auth = await readFile(
        `${backendContainer.rootfs}/${btcMountpoint}/${bitcoinConfDefaults.rpccookiefile}`,
        {
          encoding: 'base64',
        },
      )
      const txIndexReq = fetch('http://bitcoind.startos:8332', {
        method: 'POST',
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
          return jsonRes
        })
        .catch((e: any) => {
          throw new Error(e)
        })

      const ibdStateReq = fetch('http://bitcoind.startos:8332', {
        method: 'POST',
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

  // set permissions, needs to be in main container, not a temp
  await backendContainer.execFail(['groupadd', '-g', '1000', 'memgroup'], {
    user: 'root',
  })
  await backendContainer.execFail(
    [
      'useradd',
      '-u',
      '1000',
      '-g',
      '1000',
      '-m',
      '-d',
      '/home/memuser',
      'memuser',
    ],
    {
      user: 'root',
    },
  )
  await backendContainer.execFail(['chmod', '1000', '/backend/cache'], {
    user: 'root',
  })
  await backendContainer.execFail(['chown', '1000:1000', '/backend/cache'], {
    user: 'root',
  })
  await backendContainer.execFail(
    ['cp', '/backend/cache/mempool-config.json', '/backend'],
    { user: 'root' },
  )
  await backendContainer.execFail(
    ['chown', '1000:1000', '/mnt/bitcoind/.cookie'],
    { user: 'root' },
  )

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
        command: sdk.useEntrypoint(),
        env: {
          MYSQL_DATABASE: config.DATABASE.DATABASE,
          MYSQL_USER: config.DATABASE.USERNAME,
          MYSQL_PASSWORD: config.DATABASE.PASSWORD,
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
        command: ['node', '/backend/package/index.js'],
        user: '1000',
        env: {
          NODE_OPTIONS: '--max-old-space-size=2048',
        },
      },
      ready: {
        gracePeriod: 45_000,
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
        command: sdk.useEntrypoint(),
        user: '1000',
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
