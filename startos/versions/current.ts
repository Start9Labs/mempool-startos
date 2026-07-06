import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { configJson } from '../file-models/mempool-config.json'

export const current = VersionInfo.of({
  version: '3.3.1:15',
  releaseNotes: {
    en_US:
      'Internal updates (start-sdk 2.0.x). Fixes database backups that could previously be created empty.',
    es_ES:
      'Actualizaciones internas (start-sdk 2.0.x). Corrige las copias de seguridad de la base de datos que anteriormente podían crearse vacías.',
    de_DE:
      'Interne Aktualisierungen (start-sdk 2.0.x). Behebt Datenbank-Backups, die zuvor leer erstellt werden konnten.',
    pl_PL:
      'Aktualizacje wewnętrzne (start-sdk 2.0.x). Naprawia kopie zapasowe bazy danych, które wcześniej mogły być tworzone jako puste.',
    fr_FR:
      'Mises à jour internes (start-sdk 2.0.x). Corrige les sauvegardes de base de données qui pouvaient auparavant être créées vides.',
  },
  migrations: {
    up: async ({ effects }) => {
      // Before this version the indexer selector lived in ELECTRUM.HOST as
      // `<indexer>.startos` (there was no ELECTRUM.INDEXER field). Seed the new
      // discriminator once from that legacy value; init/watchHosts then fills
      // HOST/PORT with the resolved bridge address (or a loopback placeholder).
      const legacyHost = await configJson.read((c) => c.ELECTRUM.HOST).once()
      if (
        legacyHost === 'electrs.startos' ||
        legacyHost === 'fulcrum.startos'
      ) {
        await configJson.merge(effects, {
          ELECTRUM: {
            INDEXER: legacyHost === 'fulcrum.startos' ? 'fulcrum' : 'electrs',
          },
        })
      }
    },
    down: IMPOSSIBLE,
  },
})
