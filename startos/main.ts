import { sdk } from './sdk'
import {
  apiPort,
  btcCookiePath,
  btcMountpoint,
  clnMountpoint,
  determineSyncResponse,
  IbdStateRes,
  TxIndexRes,
  uiPort,
} from './utils'
import { readFile } from 'fs/promises'
import { configJson } from './file-models/mempool-config.json'
import { FileHelper } from '@start9labs/start-sdk'
import { i18n } from './i18n'

/**
 * ======================== Mounts ========================
 */
let backendMounts = sdk.Mounts.of()
  .mountVolume({
    volumeId: 'cache',
    subpath: null,
    mountpoint: '/backend/cache',
    readonly: false,
  })
  .mountVolume({
    volumeId: 'config',
    subpath: 'mempool-config.json',
    mountpoint: '/backend/mempool-config.json',
    readonly: true,
    type: 'file',
  })
  .mountDependency({
    dependencyId: 'bitcoind',
    volumeId: 'main',
    subpath: null,
    mountpoint: btcMountpoint,
    readonly: false,
  })

export const main = sdk.setupMain(async ({ effects }) => {
  /**
   * ======================== Setup ========================
   */
  console.info(i18n('Starting Mempool...'))

  // ========================
  // Dependency setup & checks
  // ========================

  const config = await configJson.read().const(effects)
  if (!config) throw new Error('Config file not found')

  if (config.LIGHTNING.ENABLED) {
    switch (config.LIGHTNING.BACKEND) {
      case 'lnd':
        backendMounts = backendMounts.mountDependency({
          dependencyId: 'lnd',
          volumeId: 'main',
          subpath: null,
          mountpoint: '/mnt/lnd-readonly',
          readonly: false,
          type: 'directory',
        })
        break
      case 'cln':
        backendMounts = backendMounts.mountDependency({
          dependencyId: 'c-lightning',
          volumeId: 'main',
          subpath: 'bitcoin',
          mountpoint: clnMountpoint,
          readonly: true,
          type: 'directory',
        })
        break
      default:
        break
    }
  }

  // ========================
  // Set containers
  // ========================

  const backendSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'backend' },
    backendMounts,
    'backend-api',
  )

  // Restart on Bitcoin cookie change
  await FileHelper.string(`${backendSub.rootfs}${btcCookiePath}`)
    .read()
    .const(effects)

  // ========================
  // Additional health check(s)
  // ========================

  const syncHealthCheck = {
    display: i18n('Transaction Indexer'),
    fn: async () => {
      const auth = await readFile(`${backendSub.rootfs}${btcCookiePath}`, {
        encoding: 'base64',
      })
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

  const mariaSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'mariadb' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'db',
      subpath: null,
      mountpoint: '/var/lib/mysql',
      readonly: false,
    }),
    'mariadb-sub',
  )

  /**
   *  ======================== Daemons ========================
   */
  return sdk.Daemons.of(effects)
    .addDaemon('mariadb', {
      subcontainer: mariaSub,
      exec: {
        command: sdk.useEntrypoint(),
        env: {
          MARIADB_RANDOM_ROOT_PASSWORD: '1',
          MYSQL_DATABASE: config.DATABASE.DATABASE,
          MYSQL_USER: config.DATABASE.USERNAME,
          MYSQL_PASSWORD: config.DATABASE.PASSWORD,
        },
      },
      ready: {
        gracePeriod: 120_000,
        display: null,
        fn: async () => {
          const res = await mariaSub.exec([
            'healthcheck.sh',
            '--connect',
            '--innodb_initialized',
          ])

          if (res.exitCode !== 0) {
            return {
              result: 'loading',
              message: null,
            }
          }
          return {
            result: 'success',
            message: null,
          }
        },
      },
      requires: [],
    })
    .addDaemon('api', {
      subcontainer: backendSub,
      exec: {
        command: ['node', '/backend/package/index.js'],
        user: 'root',
        env: {
          // @TODO look into this
          NODE_OPTIONS: '--max-old-space-size=2048',
        },
      },
      ready: {
        gracePeriod: 45_000,
        display: i18n('API'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, apiPort, {
            successMessage: i18n('The API is ready'),
            errorMessage: i18n('The API is not ready'),
          }),
      },
      requires: ['mariadb'],
    })
    .addHealthCheck('sync', { ready: syncHealthCheck, requires: ['api'] })
    .addDaemon('webui', {
      subcontainer: await sdk.SubContainer.of(
        effects,
        { imageId: 'frontend' },
        null,
        'user-interface',
      ),
      exec: {
        command: sdk.useEntrypoint(),
        env: config.LIGHTNING.ENABLED
          ? {
              LIGHTNING: 'true',
            }
          : {},
      },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('The web interface is ready'),
            errorMessage: i18n('The web interface is not ready'),
          }),
      },
      requires: ['api'],
    })
})
