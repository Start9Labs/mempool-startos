import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.1:10',
  releaseNotes: {
    en_US:
      'The web interface now starts only after the backend API is ready, so it no longer briefly serves before the backend is reachable.',
    es_ES:
      'La interfaz web ahora se inicia solo después de que la API del backend esté lista, de modo que ya no se sirve brevemente antes de que el backend sea accesible.',
    de_DE:
      'Die Weboberfläche startet jetzt erst, wenn die Backend-API bereit ist, und wird nicht mehr kurzzeitig ausgeliefert, bevor das Backend erreichbar ist.',
    pl_PL:
      'Interfejs sieciowy uruchamia się teraz dopiero po gotowości API backendu, więc nie jest już przez chwilę serwowany, zanim backend stanie się osiągalny.',
    fr_FR:
      'L’interface web ne démarre désormais qu’une fois l’API du backend prête, et n’est donc plus servie brièvement avant que le backend soit joignable.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
