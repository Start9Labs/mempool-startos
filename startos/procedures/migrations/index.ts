import { setupMigrations } from '@start9labs/start-sdk/lib/inits/migrations/setupMigrations'
import { manifest } from '../../manifest'
import { v2_5_0_2 } from './v2502'

/**
 * Add each new migration as the next argument to this function
 */
export const migrations = setupMigrations(manifest, v2_5_0_2)
