import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { configJson } from '../file-models/mempool-config.json'
import { DEFAULT_PROFILE, PROFILES } from '../utils'

export const current = VersionInfo.of({
  version: '3.3.1:8',
  releaseNotes: {
    en_US: 'Mounts Bitcoin Core read-only.',
    es_ES: 'Monta Bitcoin Core en modo de solo lectura.',
    de_DE: 'Bindet Bitcoin Core schreibgeschützt ein.',
    pl_PL: 'Montuje Bitcoin Core w trybie tylko do odczytu.',
    fr_FR: 'Monte Bitcoin Core en lecture seule.',
  },
  migrations: {
    up: async ({ effects }) => {
      await configJson.merge(effects, { MEMPOOL: PROFILES[DEFAULT_PROFILE] })
    },
    down: IMPOSSIBLE,
  },
})
