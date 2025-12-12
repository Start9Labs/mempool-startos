import { VersionGraph } from '@start9labs/start-sdk'
import { current, other } from './versions'
import { configJsonDefaults } from '../utils'
import { configJson } from '../file-models/mempool-config.json'

export const versionGraph = VersionGraph.of({
  current,
  other,
  preInstall: async (effects) => {
    // write config defaults
    await configJson.write(effects, configJsonDefaults)
  },
})
