import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.2:5',
  releaseNotes: {
    en_US: `Updates the Node.js runtime Mempool's backend runs on to 26.13.1, with the November 2026 Node.js security fixes.`,
    es_ES:
      'Actualiza el entorno de ejecución Node.js del backend de Mempool a 26.13.1, con las correcciones de seguridad de Node.js de noviembre de 2026.',
    de_DE:
      'Aktualisiert die Node.js-Laufzeitumgebung des Mempool-Backends auf 26.13.1 mit den Node.js-Sicherheitskorrekturen vom November 2026.',
    pl_PL:
      'Aktualizuje środowisko uruchomieniowe Node.js backendu Mempool do wersji 26.13.1 z poprawkami bezpieczeństwa Node.js z listopada 2026 r.',
    fr_FR: `Met à jour l'environnement d'exécution Node.js du backend de Mempool vers 26.13.1, avec les correctifs de sécurité Node.js de novembre 2026.`,
  },
  migrations: {
    down: IMPOSSIBLE,
  },
})
