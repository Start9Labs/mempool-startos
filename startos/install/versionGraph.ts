import { VersionGraph } from '@start9labs/start-sdk'
import { current, other } from './versions'
import { configJsonDefaults, getDbPassword } from '../utils'
import { configJson } from '../file-models/mempool-config.json'
import { storeJson } from '../file-models/store.json'
import { sdk } from '../sdk'
import { selectIndexer } from '../actions/selectIndexer'
import { i18n } from '../i18n'

export const versionGraph = VersionGraph.of({
  current,
  other,
  preInstall: async (effects) => {
    const dbPassword = getDbPassword()
    await storeJson.write(effects, { dbPassword })
    await configJson.write(effects, {
      ...configJsonDefaults,
      DATABASE: { ...configJsonDefaults.DATABASE, PASSWORD: dbPassword },
    })
    await sdk.action.createOwnTask(effects, selectIndexer, 'critical', {
      reason: i18n('Select which Electrum server to use for address lookups'),
    })
  },
})
