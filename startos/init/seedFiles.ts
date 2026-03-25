import { selectIndexer } from '../actions/selectIndexer'
import { configJson } from '../file-models/mempool-config.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getDbPassword } from '../utils'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind === 'install') {
    await configJson.merge(effects, {
      DATABASE: { PASSWORD: getDbPassword() },
    })
    await sdk.action.createOwnTask(effects, selectIndexer, 'critical', {
      reason: i18n('Select which Electrum server to use for address lookups'),
    })
  } else {
    await configJson.merge(effects, {})
  }
})
