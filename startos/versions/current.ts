import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.1:13',
  releaseNotes: {
    en_US: `- Fix a startup crash on hosts with 8 GB of RAM or less: the backend heap cap was set below what the backend needs to load its disk cache, causing a JavaScript heap out-of-memory crash on every start.`,
    es_ES: `- Corrige un fallo de inicio en equipos con 8 GB de RAM o menos: el limite de memoria del backend estaba por debajo de lo que necesita para cargar su cache en disco, provocando un fallo por falta de memoria en cada arranque.`,
    de_DE: `- Behebt einen Startabsturz auf Systemen mit 8 GB Arbeitsspeicher oder weniger: Das Backend-Speicherlimit lag unter dem Bedarf zum Laden des Festplatten-Caches und verursachte bei jedem Start einen Speichermangel-Absturz.`,
    pl_PL: `- Naprawia awarie uruchamiania na urzadzeniach z 8 GB pamieci RAM lub mniej: limit pamieci backendu byl nizszy niz potrzebny do zaladowania pamieci podrecznej na dysku, co powodowalo awarie z powodu braku pamieci przy kazdym starcie.`,
    fr_FR: `- Corrige un plantage au demarrage sur les hotes disposant de 8 Go de RAM ou moins : la limite de memoire du backend etait inferieure a ce dont il a besoin pour charger son cache disque, provoquant un plantage par manque de memoire a chaque demarrage.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
