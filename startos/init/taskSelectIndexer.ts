import { selectIndexer } from '../actions/selectIndexer'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { selectedIndexer } from '../utils'

export const taskSelectIndexer = sdk.setupOnInit(async (effects) => {
  if (await selectedIndexer(effects)) return
  await sdk.action.createOwnTask(effects, selectIndexer, 'critical', {
    reason: i18n('Select which Electrum server to use for address lookups'),
  })
})
