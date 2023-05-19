import { sdk } from '../../../sdk'
import { configSpec } from '../../config/spec'
import { helloWorldConfig } from './hello-world'

/**
 * Consolidate all dependency configs here
 */
export const dependencyConfig = sdk.setupDependencyConfig(configSpec, {
  'hello-world': helloWorldConfig,
})
