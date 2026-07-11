import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { configJson } from '../file-models/mempool-config.json'
import { storeJson } from '../file-models/store.json'

export const current = VersionInfo.of({
  version: '3.3.1:16',
  releaseNotes: {
    en_US: 'Internal updates (start-sdk 2.0.x).',
    es_ES: 'Actualizaciones internas (start-sdk 2.0.x).',
    de_DE: 'Interne Aktualisierungen (start-sdk 2.0.x).',
    pl_PL: 'Aktualizacje wewnętrzne (start-sdk 2.0.x).',
    fr_FR: 'Mises à jour internes (start-sdk 2.0.x).',
  },
  migrations: {
    up: async ({ effects }) => {
      // Before this version the indexer selector lived in ELECTRUM.HOST as
      // `<indexer>.startos`. It is now StartOS state in store.json; seed it once
      // from that legacy value (unless already set). init/watchHosts then fills
      // ELECTRUM.HOST/PORT with the resolved bridge address.
      const existing = await storeJson.read((s) => s.indexer).once()
      if (existing) return
      const legacyHost = await configJson.read((c) => c.ELECTRUM.HOST).once()
      if (
        legacyHost === 'electrs.startos' ||
        legacyHost === 'fulcrum.startos'
      ) {
        await storeJson.merge(effects, {
          indexer: legacyHost === 'fulcrum.startos' ? 'fulcrum' : 'electrs',
        })
      }
    },
    down: IMPOSSIBLE,
  },
})
