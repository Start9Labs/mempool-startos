import { sdk } from '../../../sdk'
import { configSpec } from '../../config/spec'
import { configSpec as helloWorldSpec } from 'hello-world-wrapper/startos/procedures/config/spec'

/**
 * In this function, you establish rules for configuring a dependency
 *
 * End user approval is required before changes are applied
 */
export const helloWorldConfig = sdk.DependencyConfig.of({
  localConfig: configSpec,
  remoteConfig: helloWorldSpec,
  dependencyConfig: async ({ effects, utils, localConfig, remoteConfig }) => {
    return {
      name: 'Satoshi',
    }
  },
})
