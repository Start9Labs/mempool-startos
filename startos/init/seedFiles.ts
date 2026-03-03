import { sdk } from '../sdk'
import { configJson } from '../file-models/mempool-config.json'
import { getDbPassword } from '../utils'
import { selectIndexer } from '../actions/selectIndexer'
import { i18n } from '../i18n'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  const dbPassword = getDbPassword()
  await configJson.merge(effects, {
    DATABASE: { PASSWORD: dbPassword },
  })
  await sdk.action.createOwnTask(effects, selectIndexer, 'critical', {
    reason: i18n('Select which Electrum server to use for address lookups'),
  })
})
