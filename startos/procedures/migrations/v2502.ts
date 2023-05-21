import { Migration } from '@start9labs/start-sdk/lib/inits/migrations/Migration'

/**
 * This is an example migration file
 *
 * By convention, each version service requiring a migration receives its own file
 *
 * The resulting migration (e.g. v4000) is exported, then imported into migration/index.ts
 */
export const v2_5_0_2 = new Migration({
  version: '2.5.0.2',
  up: async ({ effects }) => await effects.setConfigured(true),
  down: async ({ effects }) => {},
})
