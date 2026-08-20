import { storeJson } from '../file-models/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  enabled: Value.toggle({
    name: i18n('Use Tor for External Requests'),
    description: i18n(
      'Sends every request Mempool makes to the internet — fiat exchange rates, the mining pool definitions, and the external data server — through the Tor service running on this server. Bitcoin, your Electrum indexer, and the database are reached directly and are unaffected.',
    ),
    default: false,
  }),
})

export const torProxy = sdk.Action.withInput(
  'tor-proxy',

  {
    name: i18n('Route External Requests Over Tor'),
    description: i18n(
      "Route Mempool's outbound internet requests through Tor. Useful where an ISP or national firewall blocks the endpoints Mempool reads from, and where the server's own name resolution is unreliable — a SOCKS proxy resolves hostnames at the proxy rather than locally.",
    ),
    warning: i18n('This requires the Tor service to be installed and running.'),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },

  inputSpec,

  async ({ effects }) => ({
    enabled: (await storeJson.read((s) => s?.torProxy).const(effects)) ?? false,
  }),

  async ({ effects, input }) => {
    await storeJson.merge(effects, { torProxy: input.enabled })
  },
)
