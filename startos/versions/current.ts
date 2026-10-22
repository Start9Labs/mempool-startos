import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.2:0',
  releaseNotes: {
    en_US:
      'Updated Mempool to 3.3.2 with Node.js 26.12.1 and fixed certificate stores. Removed the temporary CA-store layer and refreshed the bundled mining pool definitions. Upstream changes: https://github.com/mempool/mempool/compare/v3.3.1...v3.3.2',
    es_ES:
      'Mempool actualizado a 3.3.2 con Node.js 26.12.1 y almacenes de certificados corregidos. Se eliminó la capa temporal de certificados y se actualizaron las definiciones de pools de minería incluidas. Cambios originales: https://github.com/mempool/mempool/compare/v3.3.1...v3.3.2',
    de_DE:
      'Mempool auf 3.3.2 mit Node.js 26.12.1 und korrigierten Zertifikatsspeichern aktualisiert. Die temporäre Zertifikatsschicht wurde entfernt und die mitgelieferten Mining-Pool-Definitionen wurden aktualisiert. Upstream-Änderungen: https://github.com/mempool/mempool/compare/v3.3.1...v3.3.2',
    pl_PL:
      'Zaktualizowano Mempool do 3.3.2 z Node.js 26.12.1 i poprawionymi magazynami certyfikatów. Usunięto tymczasową warstwę certyfikatów i odświeżono dołączone definicje pul wydobywczych. Zmiany projektu: https://github.com/mempool/mempool/compare/v3.3.1...v3.3.2',
    fr_FR:
      'Mise à jour de Mempool vers 3.3.2 avec Node.js 26.12.1 et des magasins de certificats corrigés. Suppression de la couche temporaire de certificats et actualisation des définitions de pools de minage incluses. Modifications du projet : https://github.com/mempool/mempool/compare/v3.3.1...v3.3.2',
  },
  migrations: {
    down: IMPOSSIBLE,
  },
})
