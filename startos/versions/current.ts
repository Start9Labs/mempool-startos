import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.2:9',
  releaseNotes: {
    en_US:
      'Patches a denial-of-service vulnerability that let a single visitor crash Mempool by exhausting its memory over the live-update connection.',
    es_ES:
      'Corrige una vulnerabilidad de denegación de servicio que permitía a un solo visitante bloquear Mempool agotando su memoria a través de la conexión de actualizaciones en vivo.',
    de_DE:
      'Behebt eine Denial-of-Service-Schwachstelle, durch die ein einzelner Besucher Mempool über die Live-Update-Verbindung zum Absturz bringen konnte, indem er dessen Speicher erschöpfte.',
    pl_PL:
      'Usuwa podatność typu odmowa usługi, która pozwalała pojedynczemu odwiedzającemu zawiesić Mempool przez wyczerpanie jego pamięci za pośrednictwem połączenia aktualizacji na żywo.',
    fr_FR:
      'Corrige une vulnérabilité de déni de service qui permettait à un seul visiteur de faire planter Mempool en épuisant sa mémoire via la connexion de mises à jour en direct.',
  },
  migrations: {
    down: IMPOSSIBLE,
  },
})
