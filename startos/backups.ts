import { configJson } from './file-models/mempool-config.json'
import { sdk } from './sdk'

export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.withMysqlDump({
    imageId: 'mariadb',
    dbVolume: 'db',
    datadir: '/var/lib/mysql',
    database: 'mempool',
    user: 'mempool',
    password: async () => {
      const password = await configJson.read((s) => s.DATABASE.PASSWORD).once()
      if (!password) throw new Error('No database password found in config')
      return password
    },
    engine: 'mariadb',
    readyCommand: ['healthcheck.sh', '--connect', '--innodb_initialized'],
  })
    .addVolume('cache')
    .addVolume('config'),
)
