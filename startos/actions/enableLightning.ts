import { totalmem } from 'os'
import { configJson } from '../file-models/mempool-config.json'
import { sdk } from '../sdk'
import { clnMountpoint, lndCertPath, lndMacaroonPath } from '../utils'
import { i18n } from '../i18n'
const { InputSpec, Value } = sdk

// 15 GiB floor to cover 16 GB devices that report slightly less than 16 * 2^30.
const lowRamWarning =
  totalmem() < 15 * 1024 ** 3
    ? i18n(
        'Lightning network data is memory-intensive. Running it alongside Bitcoin and an Electrum indexer on a system with less than 16 GB of RAM can trigger out-of-memory crashes that take down Mempool or one of its dependencies. Enable only if you have RAM headroom to spare.',
      )
    : null

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
export type LightningInputSpec = typeof lightningInputSpec._TYPE

export const enableLightning = sdk.Action.withInput(
  'enable-lightning',

  {
    name: i18n('Enable Lightning'),
    description: i18n(
      'Use this setting to select the Lightning node used to serve network data to the Lightning tab in Mempool',
    ),
    warning: lowRamWarning,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },

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
    switch (input.lightning) {
      case 'lnd':
        await configJson.merge(effects, {
          LIGHTNING: { ENABLED: true, BACKEND: 'lnd' },
          LND: {
            TLS_CERT_PATH: lndCertPath,
            MACAROON_PATH: lndMacaroonPath,
          },
        })
        break
      case 'cln':
        await configJson.merge(effects, {
          LIGHTNING: { ENABLED: true, BACKEND: 'cln' },
          CLIGHTNING: { SOCKET: `${clnMountpoint}/lightning-rpc` },
        })
        break
      default:
        await configJson.merge(effects, {
          LIGHTNING: { ENABLED: false },
        })
        break
    }
  },
)
