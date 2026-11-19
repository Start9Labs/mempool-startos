import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.2:7',
  releaseNotes: {
    en_US: "Updates the backend's WebSocket library to 8.21.3.",
    es_ES: 'Actualiza la biblioteca WebSocket del backend a 8.21.3.',
    de_DE: 'Aktualisiert die WebSocket-Bibliothek des Backends auf 8.21.3.',
    pl_PL: 'Aktualizuje bibliotekę WebSocket backendu do wersji 8.21.3.',
    fr_FR:
      'Met à jour la bibliothèque WebSocket du backend vers la version 8.21.3.',
  },
  migrations: {
    down: IMPOSSIBLE,
  },
})
