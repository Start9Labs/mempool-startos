import { configJson } from '../file-models/mempool-config.json'
import { sdk } from '../sdk'
import { getDbPassword } from '../utils'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind === 'install') {
    await configJson.merge(effects, {
      DATABASE: { PASSWORD: getDbPassword() },
    })
  } else {
    await configJson.merge(effects, {})
  }
})
