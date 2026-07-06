import { totalmem } from 'os'
import { configJson } from '../file-models/mempool-config.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { PROFILES, DEFAULT_PROFILE, PerformanceProfile } from '../utils'
const { InputSpec, Value } = sdk

// 15 GiB floor to cover 16 GB devices that report slightly less than 16 * 2^30.
const MIN_INDEXING_MEM_BYTES = 15 * 1024 * 1024 * 1024

const inputSpec = InputSpec.of({
  profile: Value.select({
    name: i18n('Performance Profile'),
    description: i18n(
      'Low-CPU: poll bitcoind every 8s and project 4 future blocks — recommended for low-power devices. Balanced: poll every 4s, project 6 blocks. Responsive: poll every 2s, project 8 blocks — matches the upstream in-source default and uses the most CPU.',
    ),
    default: DEFAULT_PROFILE,
    values: {
      'low-cpu': i18n('Low-CPU (recommended)'),
      balanced: i18n('Balanced'),
      responsive: i18n('Responsive'),
    },
  }),
  STATISTICS_ENABLED: Value.toggle({
    name: i18n('Enable Statistics'),
    description: i18n(
      'Collects mempool statistics (transactions per second, vbytes per second) for the dashboard charts. Disabling stops the 1 Hz sampler and the periodic statistics writes to MariaDB, reducing background CPU and disk I/O on low-power devices.',
    ),
    default: true,
  }),
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

function matchPerformanceProfile(
  pollRateMs: number,
  blocksAmount: number,
): PerformanceProfile {
  for (const [name, p] of Object.entries(PROFILES) as [
    PerformanceProfile,
    (typeof PROFILES)[PerformanceProfile],
  ][]) {
    if (
      p.POLL_RATE_MS === pollRateMs &&
      p.MEMPOOL_BLOCKS_AMOUNT === blocksAmount
    ) {
      return name
    }
  }
  return 'low-cpu'
}

export const indexingAndPerformance = sdk.Action.withInput(
  'indexing-and-performance',

  {
    name: i18n('Indexing and Performance'),
    description: i18n(
      'Tune backend behavior: poll/projection profile, mempool statistics, and optional indexing features. Changes apply on the next service restart. Enabling any indexing toggle triggers a historical backfill on the next start, which can take several hours and consume significant disk space; indexing requires at least 16 GB of system RAM and is rejected on lower-memory devices.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },

  inputSpec,

  async ({ effects }) => {
    const config = await configJson.read().const(effects)
    if (!config) throw new Error('Config file not found')
    const { MEMPOOL, STATISTICS } = config
    return {
      profile: matchPerformanceProfile(
        MEMPOOL.POLL_RATE_MS,
        MEMPOOL.MEMPOOL_BLOCKS_AMOUNT,
      ),
      STATISTICS_ENABLED: STATISTICS.ENABLED,
      BLOCKS_SUMMARIES_INDEXING: MEMPOOL.BLOCKS_SUMMARIES_INDEXING,
      GOGGLES_INDEXING: MEMPOOL.GOGGLES_INDEXING,
      AUDIT: MEMPOOL.AUDIT,
      CPFP_INDEXING: MEMPOOL.CPFP_INDEXING,
    }
  },

  async ({ effects, input }) => {
    const wantsIndexing =
      input.BLOCKS_SUMMARIES_INDEXING ||
      input.GOGGLES_INDEXING ||
      input.AUDIT ||
      input.CPFP_INDEXING
    if (wantsIndexing && totalmem() < MIN_INDEXING_MEM_BYTES) {
      throw new Error(
        i18n(
          'Indexing features require at least 16 GB of system RAM. This device has less than 16 GB available and cannot safely run backend indexing alongside Bitcoin and the selected Electrum backend.',
        ),
      )
    }
    const preset = PROFILES[input.profile as PerformanceProfile]
    return configJson.merge(effects, {
      MEMPOOL: {
        ...preset,
        BLOCKS_SUMMARIES_INDEXING: input.BLOCKS_SUMMARIES_INDEXING,
        GOGGLES_INDEXING: input.GOGGLES_INDEXING,
        AUDIT: input.AUDIT,
        CPFP_INDEXING: input.CPFP_INDEXING,
      },
      STATISTICS: { ENABLED: input.STATISTICS_ENABLED },
    })
  },
)
