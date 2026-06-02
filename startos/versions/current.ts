import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.1:9',
  releaseNotes: {
    en_US:
      'Fixes the Performance Profile being reset to Low-CPU on every update — your chosen profile is now preserved across updates.',
    es_ES:
      'Corrige el restablecimiento del Perfil de Rendimiento a CPU Baja en cada actualización; ahora se conserva el perfil que elijas entre actualizaciones.',
    de_DE:
      'Behebt das Zurücksetzen des Leistungsprofils auf Niedrige CPU bei jeder Aktualisierung; das gewählte Profil bleibt nun über Aktualisierungen hinweg erhalten.',
    pl_PL:
      'Naprawia resetowanie profilu wydajności do Niskiego CPU przy każdej aktualizacji; wybrany profil jest teraz zachowywany między aktualizacjami.',
    fr_FR:
      'Corrige la réinitialisation du profil de performance sur CPU faible à chaque mise à jour ; le profil choisi est désormais conservé d’une mise à jour à l’autre.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
