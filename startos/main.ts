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

// Absolute mountpoint of the backend disk-cache volume (see backendMounts).
const BACKEND_CACHE_DIR = '/backend/cache'
// Written when the backend starts, removed by the api health check on first
// success. If it is still present at the next start, the previous start never
// became healthy — most likely a heap-OOM while reloading an oversized on-disk
// cache — so the guard drops the cache and lets this start rebuild from live
// data instead of re-OOMing on the same file.
const BOOT_SENTINEL = `${BACKEND_CACHE_DIR}/.starting`
const BOOT_GUARD_CMD: [string, ...string[]] = [
  '/bin/sh',
  '-c',
  [
    `if [ -e "${BOOT_SENTINEL}" ]; then`,
    `echo "mempool: previous start did not reach readiness; clearing backend disk cache to break a possible out-of-memory boot loop" >&2;`,
    `rm -rf "${BACKEND_CACHE_DIR}"/* "${BACKEND_CACHE_DIR}"/.[!.]* 2>/dev/null || true;`,
    `fi;`,
    `: > "${BOOT_SENTINEL}";`,
    `exec node /backend/package/index.js`,
  ].join(' '),
]

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

  // V8 old-space heap ceiling for the mempool backend, scaled to host RAM.
  // This is a ceiling, not a reservation: the backend's steady-state heap sits
  // well under it, so raising it does not grow normal RAM use — it only lets a
  // transient startup peak (reloading the on-disk mempool/RBF cache) finish
  // instead of self-OOMing. An earlier version pinned this at 2 GB for every
  // host up to ~22 GB RAM (the /8 share never cleared the 2 GB floor), so a
  // 16 GB host whose cache needed >2 GB to reload crashed with "JavaScript heap
  // out of memory" on every start (start-os#3326). Reserve 6 GB for the
  // co-resident stack (Bitcoin Core, the Electrum indexer, any Lightning node,
  // StartOS/OS) and share the remainder: 1/3 with indexing off (2 GB floor),
  // 1/2 with any indexing toggle on (4 GB floor, heavier working set). A cache
  // too large to reload even under this ceiling is handled by the boot guard on
  // the api daemon, which drops it and rebuilds from live data.
  const RESERVED_MB = 6 * 1024
  const totalMB = Math.floor(totalmem() / (1024 * 1024))
  const effectiveMB = Math.max(0, totalMB - RESERVED_MB)
  const anyIndexing =
    config.MEMPOOL.BLOCKS_SUMMARIES_INDEXING ||
    config.MEMPOOL.GOGGLES_INDEXING ||
    config.MEMPOOL.AUDIT ||
    config.MEMPOOL.CPFP_INDEXING
  const backendMaxOldSpaceMB = anyIndexing
    ? Math.max(4096, Math.min(8192, Math.floor(effectiveMB / 2)))
    : Math.max(2048, Math.min(8192, Math.floor(effectiveMB / 3)))

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
      readonly: true,
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
  // Flipped true once the api health check first sees the port listening; gates
  // the one-time removal of the boot sentinel (see the api daemon below).
  let bootSentinelCleared = false

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
        command: BOOT_GUARD_CMD,
        user: 'root',
        env: {
          NODE_OPTIONS: `--max-old-space-size=${backendMaxOldSpaceMB}`,
        },
      },
      ready: {
        gracePeriod: 45_000,
        display: i18n('API'),
        fn: async () => {
          const res = await sdk.healthCheck.checkPortListening(
            effects,
            apiPort,
            {
              successMessage: i18n('The API is ready'),
              errorMessage: i18n('The API is not ready'),
            },
          )
          // On the first healthy report, clear the boot sentinel so a later
          // clean restart is not mistaken for a failed boot. If the backend
          // never reaches this point (e.g. an OOM boot loop), the sentinel
          // persists and the guard drops the cache on the next start.
          if (res.result === 'success' && !bootSentinelCleared) {
            bootSentinelCleared = true
            const rm = await backendSub
              .exec(['rm', '-f', BOOT_SENTINEL], { user: 'root' })
              .catch(() => null)
            // Retry on the next poll if the removal did not land, so a stale
            // sentinel can't make a later clean restart drop the cache.
            if (!rm || rm.exitCode !== 0) bootSentinelCleared = false
          }
          return res
        },
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
      // The frontend reverse-proxies the API/websocket to the backend and is
      // non-functional without it. Gating on 'api' makes the 'webui' health a
      // truthful "Mempool is usable" signal — StartOS holds/stops webui while
      // api isn't healthy and restarts it when api recovers — which dependents
      // (e.g. Am I Exposed) rely on.
      requires: ['api'],
    })
})
