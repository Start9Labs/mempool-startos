import { configJson } from '../file-models/mempool-config.json'
import { sdk } from '../sdk'
import { configJsonDefaults } from '../utils'
import { i18n } from '../i18n'
const { InputSpec, Value } = sdk

export const lightningInputSpec = InputSpec.of({
  lightning: Value.select({
    name: i18n('Lightning Node'),
    description: i18n('Select the internal node implementation'),
    default: 'none',
    values: {
      lnd: i18n('LND'),
      cln: i18n('Core Lightning'),
      none: i18n('None'),
    },
  }),
})

export const matchLightningInputSpec = lightningInputSpec.validator
export type LightningInputSpec = typeof matchLightningInputSpec._TYPE

export const enableLightning = sdk.Action.withInput(
  'enable-lightning',

  async ({ effects }) => ({
    name: i18n('Enable Lightning'),
    description: i18n(
      'Use this setting to select the Lightning node used to serve network data to the Lightning tab in Mempool',
    ),
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
        config.LND.TLS_CERT_PATH = configJsonDefaults.LND.TLS_CERT_PATH
        config.LND.MACAROON_PATH = configJsonDefaults.LND.MACAROON_PATH
        break
      case 'cln':
        config.LIGHTNING.ENABLED = true
        config.LIGHTNING.BACKEND = 'cln'
        config.CLIGHTNING.SOCKET = configJsonDefaults.CLIGHTNING.SOCKET
        break
      default:
        config.LIGHTNING.ENABLED = false
        break
    }

    await configJson.merge(effects, config)
  },
)
