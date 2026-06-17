import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.1:12',
  releaseNotes: {
    en_US: `- Cap the backend heap on hosts with 8 GB of RAM or less to reduce out-of-memory crashes.
- Warn before enabling Lightning on hosts with less than 16 GB of RAM.`,
    es_ES: `- Limita la memoria del backend en equipos con 8 GB de RAM o menos para reducir los fallos por falta de memoria.
- Advierte antes de habilitar Lightning en equipos con menos de 16 GB de RAM.`,
    de_DE: `- Begrenzt den Backend-Speicher auf Systemen mit 8 GB Arbeitsspeicher oder weniger, um Speichermangel-Abstuerze zu reduzieren.
- Warnt vor dem Aktivieren von Lightning auf Systemen mit weniger als 16 GB Arbeitsspeicher.`,
    pl_PL: `- Ogranicza pamiec backendu na urzadzeniach z 8 GB pamieci RAM lub mniej, aby zmniejszyc liczbe awarii z powodu braku pamieci.
- Ostrzega przed wlaczeniem Lightning na urzadzeniach z mniej niz 16 GB pamieci RAM.`,
    fr_FR: `- Limite la memoire du backend sur les hotes disposant de 8 Go de RAM ou moins pour reduire les plantages par manque de memoire.
- Avertit avant d'activer Lightning sur les hotes disposant de moins de 16 Go de RAM.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
