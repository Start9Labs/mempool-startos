import { configJson } from '../file-models/mempool-config.json'
import { sdk } from '../sdk'
import { configJsonDefaults } from '../utils'
const { InputSpec, Value } = sdk

const electrsInputSpec = InputSpec.of({
  electrs: Value.toggle({
    name: 'Enable Electrs',
    description: 'Enables address lookups via an internal electrs instance',
    default: true,
  }),
})

const matchElectrsInputSpec = electrsInputSpec.validator
type ElectrsInputSpec = typeof matchElectrsInputSpec._TYPE

export const enableAddressLookups = sdk.Action.withInput(
  'enable-address-lookups',

  async ({ effects }) => ({
    name: 'Enable Address Lookups',
    description: 'Enables address lookups via an internal electrs instance',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  electrsInputSpec,

  // optionally pre-fill the input form
  async ({ effects }) => {
    const configFile = await configJson.read().const(effects)
    if (!configFile) throw new Error('Config file not found')

    return {
      electrs: configFile.MEMPOOL.BACKEND === 'electrum' ? true : false,
    } as ElectrsInputSpec
  },

  // the execution function
  async ({ effects, input }) => {
    const configFile = await configJson.read().const(effects)
    if (!configFile) throw new Error('Config file not found')

    // return early if nothing changed
    if ((configFile.MEMPOOL.BACKEND === 'electrum') === input.electrs) return

    if (input.electrs) {
      configFile.MEMPOOL.BACKEND = 'electrum'
    } else {
      configFile.MEMPOOL.BACKEND = 'none'
    }

    await configJson.merge(effects, configFile)
  },
)
