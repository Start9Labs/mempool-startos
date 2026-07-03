import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

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
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
