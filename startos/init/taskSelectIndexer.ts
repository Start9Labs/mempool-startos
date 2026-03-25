import { selectIndexer } from '../actions/selectIndexer'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const taskSelectIndexer = sdk.setupOnInit(async (effects, kind) => {
  if (kind === 'install') {
    await sdk.action.createOwnTask(effects, selectIndexer, 'critical', {
      reason: i18n('Select which Electrum server to use for address lookups'),
    })
  }
})
