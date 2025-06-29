import { sdk } from '../sdk'
import { enableAddressLookups } from './enableAddressLookups'
import { enableLightning } from './enableLightning'

export const actions = sdk.Actions.of()
  .addAction(enableAddressLookups)
  .addAction(enableLightning)
