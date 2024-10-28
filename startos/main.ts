import { sdk } from './sdk'
import { T } from '@start9labs/start-sdk'
import { apiPort, dbPort, uiPort } from './utils'

export const backendMounts = sdk.Mounts.of().addVolume(
  'backend',
  null,
  '/backend/cache',
  false,
)

export const main = sdk.setupMain(async ({ effects, started }) => {
  console.info('Starting Mempool!')

  const healthReceipts: T.HealthReceipt[] = []

  return sdk.Daemons.of({
    effects,
    started,
    healthReceipts,
  })
    .addDaemon('mariadb', {
      image: { id: 'mariadb' },
      command: [
        '/usr/bin/mysqld_safe',
        '--user=mysql',
        "--datadir='/var/lib/mysql",
      ],
      mounts: sdk.Mounts.of().addVolume(
        'mariadb',
        null,
        '/var/lib/mysql',
        false,
      ),
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
      image: { id: 'backend' },
      command: [
        '/backend/wait-for-it.sh',
        `localhost:${apiPort}`,
        '--timeout=720',
        '--strict',
        '-- ./start.sh',
      ],
      mounts: backendMounts,
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
    .addDaemon('webui', {
      image: { id: 'frontend' },
      command: ['nginx', '-g', "'daemon off;'"],
      mounts: sdk.Mounts.of().addVolume('frontend', null, '/root', false),
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
