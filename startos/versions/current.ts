import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { configJson } from '../file-models/mempool-config.json'
import { DEFAULT_PROFILE, PROFILES } from '../utils'

export const current = VersionInfo.of({
  version: '3.3.1:7',
  releaseNotes: {
    en_US:
      'Mounts Bitcoin Core read-only and reconnects automatically when Bitcoin Core restarts and rotates its RPC cookie.',
    es_ES:
      'Monta Bitcoin Core en modo de solo lectura y se reconecta automáticamente cuando Bitcoin Core se reinicia y rota su cookie de RPC.',
    de_DE:
      'Bindet Bitcoin Core schreibgeschützt ein und stellt die Verbindung automatisch wieder her, wenn Bitcoin Core neu startet und sein RPC-Cookie wechselt.',
    pl_PL:
      'Montuje Bitcoin Core w trybie tylko do odczytu i automatycznie ponawia połączenie, gdy Bitcoin Core uruchamia się ponownie i zmienia swój plik cookie RPC.',
    fr_FR:
      'Monte Bitcoin Core en lecture seule et se reconnecte automatiquement lorsque Bitcoin Core redémarre et renouvelle son cookie RPC.',
  },
  migrations: {
    up: async ({ effects }) => {
      await configJson.merge(effects, { MEMPOOL: PROFILES[DEFAULT_PROFILE] })
    },
    down: IMPOSSIBLE,
  },
})
