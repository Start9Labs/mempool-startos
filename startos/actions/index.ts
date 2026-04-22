import { sdk } from '../sdk'
import { selectIndexer } from './selectIndexer'
import { enableLightning } from './enableLightning'
import { configureIndexing } from './configureIndexing'

export const actions = sdk.Actions.of()
  .addAction(selectIndexer)
  .addAction(enableLightning)
  .addAction(configureIndexing)
