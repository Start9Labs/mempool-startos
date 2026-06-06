import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.1:11',
  releaseNotes: {
    en_US:
      'Fixes the Lightning tab never loading with an LND backend (corrected the read-only macaroon path).',
    es_ES:
      'Corrige que la pestaña Lightning nunca cargara con un backend LND (se corrigió la ruta de la macaroon de solo lectura).',
    de_DE:
      'Behebt, dass der Lightning-Tab mit einem LND-Backend nie geladen wurde (Pfad der Read-only-Macaroon korrigiert).',
    pl_PL:
      'Naprawia brak ładowania zakładki Lightning przy backendzie LND (poprawiono ścieżkę macaroon tylko do odczytu).',
    fr_FR:
      "Corrige l'onglet Lightning qui ne se chargeait jamais avec un backend LND (chemin de la macaroon en lecture seule corrigé).",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
