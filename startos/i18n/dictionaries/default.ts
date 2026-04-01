export const DEFAULT_LANG = 'en_US'

const dict = {
  'Starting Mempool': 0,
  'Transaction Indexer': 1,
  API: 2,
  'The API is ready': 3,
  'The API is not ready': 4,
  'Web Interface': 5,
  'The web interface is ready': 6,
  'The web interface is not ready': 7,
  'Initial blockchain download still in progress. Mempool will not display correctly until this is complete.': 8,
  'Transaction Indexer is still syncing. Mempool will not display correctly until sync is complete.': 9,
  'Fully synced.': 10,
  'Mempool is starting': 11,
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
} as const

export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
