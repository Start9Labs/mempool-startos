import { utils } from '@start9labs/start-sdk'

export const randomPassword = {
  charset: 'a-z,A-Z,1-9',
  len: 22,
}

export function getDbPassword(): string {
  return utils.getDefaultString(randomPassword)
}

export const uiPort = 8080
export const apiPort = 8999
export const dbPort = 3306
export const btcMountpoint = '/mnt/bitcoind'
export const lndMountpoint = '/mnt/lnd'
export const clnMountpoint = '/mnt/cln'

// Performance profile presets. POLL_RATE_MS is the main-loop period;
// MEMPOOL_BLOCKS_AMOUNT is the depth of the Rust GBT projection. Both
// scale backend CPU roughly linearly. Single source of truth — referenced
// by the file model defaults, the migration, and the action.
export type PerformanceProfile = 'low-cpu' | 'balanced' | 'responsive'

export const PROFILES: Record<
  PerformanceProfile,
  { POLL_RATE_MS: number; MEMPOOL_BLOCKS_AMOUNT: number }
> = {
  'low-cpu': { POLL_RATE_MS: 8000, MEMPOOL_BLOCKS_AMOUNT: 4 },
  balanced: { POLL_RATE_MS: 4000, MEMPOOL_BLOCKS_AMOUNT: 6 },
  responsive: { POLL_RATE_MS: 2000, MEMPOOL_BLOCKS_AMOUNT: 8 },
}

export const DEFAULT_PROFILE: PerformanceProfile = 'low-cpu'
