import { sdk } from './sdk'

// Back up config and startos only (persisted configuration + the selected
// indexer in store.json). The db and cache are derived from Bitcoin and rebuilt
// by re-indexing on restore, so dumping the db (which failed on large indexed
// installs) is unnecessary.
export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.ofVolumes('config', 'startos'),
)
