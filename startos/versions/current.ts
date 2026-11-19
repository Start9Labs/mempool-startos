import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.2:7',
  releaseNotes: {
    en_US:
      "Requires StartOS 0.4.2 or later. Updates the backend's WebSocket library to 8.21.3.",
    es_ES:
      'Requiere StartOS 0.4.2 o posterior. Actualiza la biblioteca WebSocket del backend a 8.21.3.',
    de_DE:
      'Erfordert StartOS 0.4.2 oder neuer. Aktualisiert die WebSocket-Bibliothek des Backends auf 8.21.3.',
    pl_PL:
      'Wymaga StartOS 0.4.2 lub nowszego. Aktualizuje bibliotekę WebSocket backendu do wersji 8.21.3.',
    fr_FR:
      'Nécessite StartOS 0.4.2 ou une version ultérieure. Met à jour la bibliothèque WebSocket du backend vers la version 8.21.3.',
  },
  migrations: {
    down: IMPOSSIBLE,
  },
})
