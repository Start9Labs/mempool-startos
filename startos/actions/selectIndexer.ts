import { configJson } from '../fileModels/mempool-config.json'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { selectedIndexer } from '../utils'
const { InputSpec, Value, Variants } = sdk

const indexerInputSpec = InputSpec.of({
  indexer: Value.union({
    name: i18n('Select Indexer'),
    description: i18n(
      '- Fulcrum: Fulcrum on this server answers address lookups.\n- Electrs: Electrs on this server answers address lookups.\n- rbitcoin: the rbitcoin service on this server answers address lookups with its built-in Electrum server.\n- External Electrum server: an Electrs or Fulcrum you run elsewhere, reached over the network.\n- None: address search is turned off; the rest of Mempool keeps working.\nAn indexer on this server must be installed and running; an external one must index the same chain as the Bitcoin node Mempool reads from.',
    ),
    default: null,
    variants: Variants.of({
      fulcrum: {
        name: i18n('Fulcrum (recommended)'),
        spec: InputSpec.of({}),
      },
      electrs: {
        name: i18n('Electrs'),
        spec: InputSpec.of({}),
      },
      rbitcoin: {
        name: i18n('rbitcoin on this server'),
        spec: InputSpec.of({}),
      },
      external: {
        name: i18n('External Electrum server'),
        spec: InputSpec.of({
          host: Value.text({
            name: i18n('Electrum Host'),
            description: i18n(
              'The address of the Electrum server as this server reaches it: an IP address or hostname.',
            ),
            default: null,
            required: true,
            placeholder: '192.168.1.10',
          }),
          port: Value.number({
            name: i18n('Electrum Port'),
            description: i18n(
              'The TCP port of the Electrum server (by convention 50001 plain, 50002 with TLS).',
            ),
            default: 50001,
            required: true,
            min: 1,
            max: 65535,
            integer: true,
          }),
          tls: Value.toggle({
            name: i18n('TLS'),
            description: i18n(
              'Connect with TLS. Needed when the server only offers an encrypted port.',
            ),
            default: false,
          }),
        }),
      },
      none: {
        name: i18n('None — address lookups disabled'),
        spec: InputSpec.of({}),
      },
    }),
  }),
})

export const selectIndexer = sdk.Action.withInput(
  'select-indexer',

  {
    name: i18n('Select Indexer'),
    description: i18n(
      'Choose the Electrum server Mempool uses to look up addresses, or turn address lookups off.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },

  // form input specification
  indexerInputSpec,

  // pre-fill the form: the choice from StartOS state, an external server's
  // address from where the backend reads it
  async ({ effects }) => {
    const indexer = await selectedIndexer(effects)
    if (!indexer) return {}
    if (indexer !== 'external') return { indexer: { selection: indexer } }
    const electrum = await configJson.read((c) => c.ELECTRUM).const(effects)
    return {
      indexer: {
        selection: 'external' as const,
        value: {
          host: electrum?.HOST ?? '',
          port: electrum?.PORT ?? 50001,
          tls: electrum?.TLS_ENABLED ?? false,
        },
      },
    }
  },

  // the execution function. Record the choice in StartOS state; for an indexer
  // on this server, init/watchHosts resolves its LXC-bridge address into
  // ELECTRUM.HOST/PORT next start. An external server's address goes straight
  // into ELECTRUM, which watchHosts then leaves alone.
  async ({ effects, input }) => {
    if (input.indexer.selection === 'external') {
      const { host, port, tls } = input.indexer.value
      await configJson.merge(effects, {
        ELECTRUM: { HOST: host, PORT: port, TLS_ENABLED: tls },
      })
    }
    await storeJson.merge(effects, { indexer: input.indexer.selection })
  },
)
