import { totalmem } from 'os'
import { manifest as bitcoinManifest } from 'bitcoin-core-startos/startos/manifest'
import { manifest as clnManifest } from 'cln-startos/startos/manifest'
import { manifest as lndManifest } from 'lnd-startos/startos/manifest'
import { configJson } from './file-models/mempool-config.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  apiPort,
  btcMountpoint,
  clnMountpoint,
  lndMountpoint,
  uiPort,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  /**
   * ======================== Setup ========================
   */
  console.info(i18n('Starting Mempool'))

  // ========================
  // Dependency setup & checks
  // ========================

  const config = await configJson.read().const(effects)
  if (!config) throw new Error('Config file not found')

  // V8 old-space heap for the mempool backend, scaled to host RAM.
  // Reserve 6 GB for the co-resident stack (Bitcoin Core post-sync,
  // Fulcrum/Electrs, LND/CLN, StartOS and OS overhead) before computing
  // our share. Indexing (audit/goggles/summaries/cpfp) is memory-hungry,
  // so when any of those toggles is on we raise the floor and share a
  // larger fraction of the remaining host RAM.
  const RESERVED_MB = 6 * 1024
  const totalMB = Math.floor(totalmem() / (1024 * 1024))
  const effectiveMB = Math.max(0, totalMB - RESERVED_MB)
  const anyIndexing =
    config.MEMPOOL.BLOCKS_SUMMARIES_INDEXING ||
    config.MEMPOOL.GOGGLES_INDEXING ||
    config.MEMPOOL.AUDIT ||
    config.MEMPOOL.CPFP_INDEXING
  const backendMaxOldSpaceMB = anyIndexing
    ? Math.max(4096, Math.min(8192, Math.floor(effectiveMB / 4)))
    : Math.max(2048, Math.min(8192, Math.floor(effectiveMB / 8)))

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
    .mountDependency<typeof bitcoinManifest>({
      dependencyId: 'bitcoind',
      volumeId: 'main',
      subpath: null,
      mountpoint: btcMountpoint,
      readonly: false,
    })

  if (config.LIGHTNING.ENABLED) {
    switch (config.LIGHTNING.BACKEND) {
      case 'lnd':
        backendMounts = backendMounts.mountDependency<typeof lndManifest>({
          dependencyId: 'lnd',
          volumeId: 'main',
          subpath: null,
          mountpoint: lndMountpoint,
          readonly: true,
          type: 'directory',
        })
        break
      case 'cln':
        backendMounts = backendMounts.mountDependency<typeof clnManifest>({
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

  const frontendSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'frontend' },
    null,
    'user-interface',
  )

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
        command: sdk.useEntrypoint(['--bind-address=127.0.0.1']),
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
          NODE_OPTIONS: `--max-old-space-size=${backendMaxOldSpaceMB}`,
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
    .addDaemon('webui', {
      subcontainer: frontendSub,
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
      requires: [],
    })
})
