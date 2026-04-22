import { totalmem } from 'os'
import { configJson } from '../file-models/mempool-config.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
const { InputSpec, Value } = sdk

// 15 GiB floor to cover 16 GB devices that report slightly less than 16 * 2^30.
const MIN_INDEXING_MEM_BYTES = 15 * 1024 * 1024 * 1024

const indexingInputSpec = InputSpec.of({
  BLOCKS_SUMMARIES_INDEXING: Value.toggle({
    name: i18n('Block Summaries Indexing'),
    description: i18n(
      'Indexes a compact per-transaction summary of every block. Powers the expected-vs-actual fee visualization and per-block fee histograms. Required for Block Audit.',
    ),
    default: false,
  }),
  GOGGLES_INDEXING: Value.toggle({
    name: i18n('Goggles Indexing'),
    description: i18n(
      'Indexes per-transaction metadata (RBF, script types, annex, sighash). Powers the colored goggles overlay filters on mempool and block views, including annex and sighash highlighting.',
    ),
    default: false,
  }),
  AUDIT: Value.toggle({
    name: i18n('Block Audit'),
    description: i18n(
      'On every new block, compares what miners included vs. what the mempool predicted and flags missing, added, prioritized, and accelerated transactions. Requires Block Summaries Indexing.',
    ),
    default: false,
  }),
  CPFP_INDEXING: Value.toggle({
    name: i18n('CPFP Indexing'),
    description: i18n(
      'Historically indexes CPFP (Child-Pays-For-Parent) relationships, enabling the full CPFP view on older blocks.',
    ),
    default: false,
  }),
})

export const configureIndexing = sdk.Action.withInput(
  'configure-indexing',

  {
    name: i18n('Configure Indexing'),
    description: i18n(
      'Enable optional indexing features that unlock richer block visualizations and audit data. Each toggle trades disk space and CPU for more features. Requires at least 16 GB of system RAM — rejected on lower-memory devices. Changes apply on the next service restart.',
    ),
    warning: i18n(
      'Enabling indexing will trigger a historical backfill on the next start, which can take several hours and consume significant disk space.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },

  indexingInputSpec,

  async ({ effects }) => configJson.read((c) => c.MEMPOOL).once(),

  async ({ effects, input }) => {
    const wantsIndexing =
      input.BLOCKS_SUMMARIES_INDEXING ||
      input.GOGGLES_INDEXING ||
      input.AUDIT ||
      input.CPFP_INDEXING
    if (wantsIndexing && totalmem() < MIN_INDEXING_MEM_BYTES) {
      throw new Error(
        i18n(
          'Indexing features require at least 16 GB of system RAM. This device has less than 16 GB available and cannot safely run backend indexing alongside Bitcoin Core and the selected Electrum backend.',
        ),
      )
    }
    return configJson.merge(effects, { MEMPOOL: input })
  },
)
