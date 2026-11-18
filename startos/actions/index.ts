import { sdk } from '../sdk'
import { selectNode } from './selectNode'
import { selectIndexer } from './selectIndexer'
import { enableLightning } from './enableLightning'
import { indexingAndPerformance } from './indexingAndPerformance'
import { clearBackendCache } from './clearBackendCache'
import { torProxy } from './torProxy'

export const actions = sdk.Actions.of()
  .addAction(selectNode)
  .addAction(selectIndexer)
  .addAction(enableLightning)
  .addAction(indexingAndPerformance)
  .addAction(torProxy)
  .addAction(clearBackendCache)
