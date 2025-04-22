import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const v321_1 = VersionInfo.of({
  version: '3.2.1:1',
  releaseNotes: 'Updated to use new APIs for StartOS 0.3.6.',
  migrations: {
    up: async ({ effects }) => {
      // @TODO move configurations, delete config.yaml, move db files
      // make sure mempool-config.json is in proper place
    },
    down: IMPOSSIBLE,
  },
})
