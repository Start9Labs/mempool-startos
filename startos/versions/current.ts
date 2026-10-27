import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.2:1',
  releaseNotes: {
    en_US:
      'Removed the option to accelerate a transaction through mempool.space.',
    es_ES:
      'Se eliminó la opción de acelerar una transacción a través de mempool.space.',
    de_DE:
      'Die Option, eine Transaktion über mempool.space zu beschleunigen, wurde entfernt.',
    pl_PL: 'Usunięto opcję przyspieszenia transakcji przez mempool.space.',
    fr_FR:
      "Suppression de l'option permettant d'accélérer une transaction via mempool.space.",
  },
  migrations: {
    down: IMPOSSIBLE,
  },
})
