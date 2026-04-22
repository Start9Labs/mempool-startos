export const DEFAULT_LANG = 'en_US'

const dict = {
  'Starting Mempool': 0,
  API: 2,
  'The API is ready': 3,
  'The API is not ready': 4,
  'Web Interface': 5,
  'The web interface is ready': 6,
  'The web interface is not ready': 7,
  'Web UI': 12,
  'The web interface of Mempool': 13,
  'Select Indexer': 14,
  'Enables address lookups via an internal indexer instance': 15,
  'Select an Electrum server to use for address lookups': 16,
  'Fulcrum (recommended)': 17,
  Electrs: 18,
  'Lightning Node': 19,
  'Select the internal node implementation': 20,
  'Enable Lightning': 21,
  'Use this setting to select the Lightning node used to serve network data to the Lightning tab in Mempool': 22,
  LND: 23,
  'Core Lightning': 24,
  None: 25,
  'Select which Electrum server to use for address lookups': 26,
  'Mempool requires an archival node and transaction indexing': 27,
  'Configure Indexing': 28,
  'Enable optional indexing features that unlock richer block visualizations and audit data. Each toggle trades disk space and CPU for more features. Requires at least 16 GB of system RAM — rejected on lower-memory devices. Changes apply on the next service restart.': 29,
  'Enabling indexing will trigger a historical backfill on the next start, which can take several hours and consume significant disk space.': 30,
  'Block Summaries Indexing': 31,
  'Indexes a compact per-transaction summary of every block. Powers the expected-vs-actual fee visualization and per-block fee histograms. Required for Block Audit.': 32,
  'Goggles Indexing': 33,
  'Indexes per-transaction metadata (RBF, script types, annex, sighash). Powers the colored goggles overlay filters on mempool and block views, including annex and sighash highlighting.': 34,
  'Block Audit': 35,
  'On every new block, compares what miners included vs. what the mempool predicted and flags missing, added, prioritized, and accelerated transactions. Requires Block Summaries Indexing.': 36,
  'CPFP Indexing': 37,
  'Historically indexes CPFP (Child-Pays-For-Parent) relationships, enabling the full CPFP view on older blocks.': 38,
  'Indexing features require at least 16 GB of system RAM. This device has less than 16 GB available and cannot safely run backend indexing alongside Bitcoin Core and the selected Electrum backend.': 39,
} as const

export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
