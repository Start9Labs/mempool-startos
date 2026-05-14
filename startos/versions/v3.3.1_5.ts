import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { configJson } from '../file-models/mempool-config.json'
import { PROFILES, DEFAULT_PROFILE } from '../utils'

export const v_3_3_1_5 = VersionInfo.of({
  version: '3.3.1:5',
  releaseNotes: {
    en_US: 'Internal updates (refreshed sibling package pins)',
    es_ES: 'Actualizaciones internas (pines de paquetes hermanos refrescados)',
    de_DE: 'Interne Aktualisierungen (Pins der Schwesterpakete aktualisiert)',
    pl_PL: 'Aktualizacje wewnętrzne (odświeżone piny pakietów siostrzanych)',
    fr_FR: 'Mises à jour internes (pins des paquets frères rafraîchis)',
  },
  migrations: {
    up: async ({ effects }) => {
      await configJson.merge(effects, { MEMPOOL: PROFILES[DEFAULT_PROFILE] })
    },
    down: IMPOSSIBLE,
  },
})
