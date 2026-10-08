import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { selectedIndexer } from '../utils'
const { InputSpec, Value } = sdk

const indexerInputSpec = InputSpec.of({
  indexer: Value.select({
    name: i18n('Select Indexer'),
    description: i18n(
      '- Fulcrum: Fulcrum on this server answers address lookups.\n- Electrs: Electrs on this server answers address lookups.\n- None: address search is turned off; the rest of Mempool keeps working.\nThe indexer you choose must be installed and running on this server.',
    ),
    values: {
      fulcrum: i18n('Fulcrum (recommended)'),
      electrs: i18n('Electrs'),
      none: i18n('None — address lookups disabled'),
    },
    default: null,
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

  // optionally pre-fill the input form
  async ({ effects }) => ({ indexer: await selectedIndexer(effects) }),

  // the execution function. Record the choice in StartOS state; init/watchHosts
  // resolves the indexer's LXC-bridge address into ELECTRUM.HOST/PORT next start.
  async ({ effects, input }) =>
    storeJson.merge(effects, { indexer: input.indexer }),
)
