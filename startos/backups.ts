import { sdk } from './sdk'

export const { createBackup, restoreInit } = sdk.setupBackups(
  async ({ effects }) =>
    sdk.Backups
      .ofVolumes('main', 'cache', 'config')
      .addVolume('db', {
        options: {
          delete: false,
          exclude: ['ibtmp1', 'ib_logfile*']
        }
      })
  ,
)
