import { configJson } from '../file-models/mempool-config.json'
import { sdk } from '../sdk'
const { InputSpec, Value } = sdk

export const lightningInputSpec = InputSpec.of({
  lightning: Value.select({
    name: 'Lightning Node',
    description: 'Select the internal node implementation',
    default: 'none',
    values: {
      lnd: 'LND',
      cln: 'Core Lightning',
      none: 'None',
    },
  }),
})

export const matchLightningInputSpec = lightningInputSpec.validator
export type LightningInputSpec = typeof matchLightningInputSpec._TYPE

export const enableLightning = sdk.Action.withInput(
  'enable-lightning',

  async ({ effects }) => ({
    name: 'Enable Lightning',
    description:
      'Use this setting to select the Lightning node used to serve network data to the Lightning tab in Mempool',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  lightningInputSpec,

  // optionally pre-fill the input form
  async ({ effects }) => {
    const config = await configJson.read().const(effects)
    if (!config) throw new Error('Config file not found')

    return {
      lightning: config.LIGHTNING.ENABLED ? config.LIGHTNING.BACKEND : 'none',
    } as LightningInputSpec
  },

  // the execution function
  async ({ effects, input }) => {
    const config = await configJson.read().const(effects)
    if (!config) throw new Error('Config file not found')

    // return early if nothing changed
    if (
      config.LIGHTNING.ENABLED &&
      config.LIGHTNING.BACKEND === input.lightning
    )
      return

    switch (input.lightning) {
      case 'lnd':
        config.LIGHTNING.ENABLED = true
        config.LIGHTNING.BACKEND = 'lnd'
        break
      case 'cln':
        config.LIGHTNING.ENABLED = true
        config.LIGHTNING.BACKEND = 'c-lightning' // @TODO confirm
        break
      default:
        config.LIGHTNING.ENABLED = false
        break
    }

    await configJson.merge(effects, config)
  },
)
