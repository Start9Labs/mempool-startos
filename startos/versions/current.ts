import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { configJson } from '../file-models/mempool-config.json'
import { storeJson } from '../file-models/store.json'

export const current = VersionInfo.of({
  version: '3.3.1:17',
  releaseNotes: {
    en_US: `Updates the bundled MariaDB database to 10.4.34, the final release of the 10.4 series.

This stays within the same MariaDB series, so no database migration is needed. Mempool itself is unchanged at 3.3.1.`,
    es_ES: `Actualiza la base de datos MariaDB incluida a 10.4.34, la última versión de la serie 10.4.

Se mantiene dentro de la misma serie de MariaDB, por lo que no es necesaria ninguna migración de la base de datos. Mempool en sí se mantiene sin cambios en la versión 3.3.1.`,
    de_DE: `Aktualisiert die mitgelieferte MariaDB-Datenbank auf 10.4.34, die letzte Version der 10.4-Reihe.

Die Aktualisierung bleibt innerhalb derselben MariaDB-Reihe, daher ist keine Datenbankmigration erforderlich. Mempool selbst bleibt unverändert bei 3.3.1.`,
    pl_PL: `Aktualizuje dołączoną bazę danych MariaDB do wersji 10.4.34, ostatniego wydania serii 10.4.

Aktualizacja pozostaje w obrębie tej samej serii MariaDB, więc migracja bazy danych nie jest potrzebna. Sam Mempool pozostaje bez zmian w wersji 3.3.1.`,
    fr_FR: `Met à jour la base de données MariaDB incluse vers la version 10.4.34, la dernière version de la série 10.4.

La mise à jour reste au sein de la même série MariaDB, aucune migration de la base de données n'est donc nécessaire. Mempool lui-même reste inchangé en version 3.3.1.`,
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
