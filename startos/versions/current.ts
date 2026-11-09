import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.2:4',
  releaseNotes: {
    en_US:
      "Mempool now reads only the credential it needs from LND or Core Lightning, and can no longer read that node's seed or other files. Requires LND 0.21.6-beta:3 or Core Lightning 26.6.10:3 or later.",
    es_ES:
      'Mempool ahora lee solo la credencial que necesita de LND o Core Lightning, y ya no puede leer la semilla ni otros archivos de ese nodo. Requiere LND 0.21.6-beta:3 o Core Lightning 26.6.10:3 o posterior.',
    de_DE:
      'Mempool liest von LND oder Core Lightning jetzt nur noch die benötigte Zugangsberechtigung und kann den Seed und andere Dateien dieses Knotens nicht mehr lesen. Erfordert LND 0.21.6-beta:3 oder Core Lightning 26.6.10:3 oder neuer.',
    pl_PL:
      'Mempool odczytuje teraz z LND lub Core Lightning tylko potrzebne mu poświadczenie i nie może już odczytać seeda ani innych plików tego węzła. Wymaga LND 0.21.6-beta:3 lub Core Lightning 26.6.10:3 albo nowszych.',
    fr_FR:
      "Mempool ne lit désormais que l'identifiant dont il a besoin auprès de LND ou Core Lightning, et ne peut plus lire la seed ni les autres fichiers de ce nœud. Nécessite LND 0.21.6-beta:3 ou Core Lightning 26.6.10:3 ou ultérieur.",
  },
  migrations: {
    down: IMPOSSIBLE,
  },
})
