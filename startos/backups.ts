import { configJson } from './file-models/mempool-config.json'
import { sdk } from './sdk'

// TODO: Re-enable withMysqlDump once the SDK fixes --daemonize for MariaDB.
// MariaDB does not support --daemonize (MySQL-only flag), causing backup to fail.
//
// export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
//   sdk.Backups.withMysqlDump({
//     imageId: 'mariadb',
//     dbVolume: 'db',
//     datadir: '/var/lib/mysql',
//     database: 'mempool',
//     user: 'mempool',
//     password: async () => {
//       const password = await configJson.read((s) => s.DATABASE.PASSWORD).once()
//       if (!password) throw new Error('No database password found in config')
//       return password
//     },
//     engine: 'mariadb',
//     readyCommand: ['healthcheck.sh', '--connect', '--innodb_initialized'],
//   })
//     .addVolume('main')
//     .addVolume('cache')
//     .addVolume('config'),
// )

export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.ofVolumes('main', 'db', 'cache', 'config'),
)
