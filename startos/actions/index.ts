import { sdk } from '../sdk'
import { selectIndexer } from './selectIndexer'
import { enableLightning } from './enableLightning'

export const actions = sdk.Actions.of()
  .addAction(selectIndexer)
  .addAction(enableLightning)
