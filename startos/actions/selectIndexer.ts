import { configJson } from '../file-models/mempool-config.json'
import { sdk } from '../sdk'
const { InputSpec, Value } = sdk

const indexerInputSpec = InputSpec.of({
  indexer: Value.select({
    name: 'Select Indexer',
    description: 'Select and indexer to use for address lookups',
    values: {
      none: 'None',
      electrs: 'Electrs',
      fulcrum: 'Fulcrum',
    },
    default: 'none',
  }),
})

const matchElectrsInputSpec = indexerInputSpec.validator
type ElectrsInputSpec = typeof matchElectrsInputSpec._TYPE

export const selectIndexer = sdk.Action.withInput(
  'select-indexer',

  async ({ effects }) => ({
    name: 'Select Indexer',
    description: 'Enables address lookups via an internal indexer instance',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  indexerInputSpec,

  // optionally pre-fill the input form
  async ({ effects }) => {
    const configFile = await configJson.read().const(effects)
    if (!configFile) throw new Error('Config file not found')

    return {
      indexer:
        configFile.MEMPOOL.BACKEND === 'none'
          ? 'none'
          : configFile.ELECTRUM.HOST === 'electrs.startos'
            ? 'electrum'
            : 'fulcrum',
    } as ElectrsInputSpec
  },

  // the execution function
  async ({ effects, input }) => {
    if (input.indexer === 'electrs') {
      await configJson.merge(effects, {
        MEMPOOL: { BACKEND: 'electrum' },
        ELECTRUM: { HOST: 'electrs.startos', PORT: 50001, TLS_ENABLED: false },
      })
    } else if (input.indexer === 'fulcrum') {
      await configJson.merge(effects, {
        MEMPOOL: { BACKEND: 'electrum' },
        ELECTRUM: { HOST: 'fulcrum.startos', PORT: 50001, TLS_ENABLED: false },
      })
    } else {
      await configJson.merge(effects, { MEMPOOL: { BACKEND: 'none' } })
    }
  },
)
