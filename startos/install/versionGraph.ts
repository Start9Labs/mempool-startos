import { VersionGraph } from '@start9labs/start-sdk'
import { current, other } from './versions'
import { configJsonDefaults } from '../utils'
import { configJson } from '../file-models/mempool-config.json'
import { sdk } from '../sdk'
import { selectIndexer } from '../actions/selectIndexer'

export const versionGraph = VersionGraph.of({
  current,
  other,
  preInstall: async (effects) => {
    // write config defaults
    await configJson.write(effects, configJsonDefaults)
    await sdk.action.createOwnTask(effects, selectIndexer, 'critical', {
      reason: 'Select which Electrum server to use for address lookups',
    })
  },
})
