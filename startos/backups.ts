import { sdk } from './sdk'

// Back up config only — the db and cache are derived from Bitcoin Core and
// rebuilt by re-indexing on restore, so dumping the db (which failed on large
// indexed installs) is unnecessary.
export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.ofVolumes('config'),
)
