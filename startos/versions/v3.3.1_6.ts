import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { configJson } from '../file-models/mempool-config.json'
import { PROFILES, DEFAULT_PROFILE } from '../utils'

export const v_3_3_1_6 = VersionInfo.of({
  version: '3.3.1:6',
  releaseNotes: {
    en_US:
      'Fixes a bug that caused database backups to hang and require a server restart.',
    es_ES:
      'Corrige un error que provocaba que las copias de seguridad de la base de datos se bloquearan y requirieran reiniciar el servidor.',
    de_DE:
      'Behebt einen Fehler, durch den Datenbank-Backups hängen blieben und einen Neustart des Servers erforderten.',
    pl_PL:
      'Naprawia błąd powodujący, że kopie zapasowe bazy danych zawieszały się i wymagały ponownego uruchomienia serwera.',
    fr_FR:
      'Corrige un bug qui faisait que les sauvegardes de base de données se bloquaient et nécessitaient un redémarrage du serveur.',
  },
  migrations: {
    up: async ({ effects }) => {
      await configJson.merge(effects, { MEMPOOL: PROFILES[DEFAULT_PROFILE] })
    },
    down: IMPOSSIBLE,
  },
})
