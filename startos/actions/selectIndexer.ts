import { storeJson } from '../file-models/store.json'
import { selectedIndexer } from '../indexer'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
const { InputSpec, Value } = sdk

const indexerInputSpec = InputSpec.of({
  indexer: Value.select({
    name: i18n('Select Indexer'),
    description: i18n('Select an Electrum server to use for address lookups'),
    values: {
      fulcrum: i18n('Fulcrum (recommended)'),
      electrs: i18n('Electrs'),
    },
    default: 'fulcrum',
  }),
})

export const selectIndexer = sdk.Action.withInput(
  'select-indexer',

  {
    name: i18n('Select Indexer'),
    description: i18n(
      'Enables address lookups via an internal indexer instance',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },

  // form input specification
  indexerInputSpec,

  // optionally pre-fill the input form
  async ({ effects }) => {
    const indexer = await selectedIndexer(effects)

    return {
      indexer: indexer as any,
    }
  },

  // the execution function. Record the choice in StartOS state; init/watchHosts
  // resolves the indexer's LXC-bridge address into ELECTRUM.HOST/PORT next start.
  async ({ effects, input }) =>
    storeJson.merge(effects, { indexer: input.indexer }),
)
