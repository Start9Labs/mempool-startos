import { sdk } from '../sdk'
import { selectIndexer } from './selectIndexer'
import { enableLightning } from './enableLightning'
import { indexingAndPerformance } from './indexingAndPerformance'

export const actions = sdk.Actions.of()
  .addAction(selectIndexer)
  .addAction(enableLightning)
  .addAction(indexingAndPerformance)
