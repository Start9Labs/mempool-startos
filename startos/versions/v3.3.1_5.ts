import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { configJson } from '../file-models/mempool-config.json'
import { PROFILES, DEFAULT_PROFILE } from '../utils'

export const v_3_3_1_5 = VersionInfo.of({
  version: '3.3.1:5',
  releaseNotes: {
    en_US: 'Fixes a bug that caused database backups to be empty.',
    es_ES: 'Corrige un error que provocaba que las copias de seguridad de la base de datos estuvieran vacías.',
    de_DE: 'Behebt einen Fehler, durch den Datenbank-Backups leer waren.',
    pl_PL: 'Naprawia błąd powodujący, że kopie zapasowe bazy danych były puste.',
    fr_FR: 'Corrige un bug qui rendait les sauvegardes de base de données vides.',
  },
  migrations: {
    up: async ({ effects }) => {
      await configJson.merge(effects, { MEMPOOL: PROFILES[DEFAULT_PROFILE] })
    },
    down: IMPOSSIBLE,
  },
})
