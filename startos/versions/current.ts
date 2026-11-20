import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.2:8',
  releaseNotes: {
    en_US:
      'Enable Lightning now warns that choosing Core Lightning gives Mempool full control of your Core Lightning node, including its funds.',
    es_ES:
      'Habilitar Lightning ahora advierte que elegir Core Lightning da a Mempool el control total de su nodo Core Lightning, incluidos sus fondos.',
    de_DE:
      'Lightning aktivieren warnt jetzt, dass Mempool bei Wahl von Core Lightning die volle Kontrolle über Ihren Core-Lightning-Knoten erhält, einschließlich seiner Guthaben.',
    pl_PL:
      'Włącz Lightning ostrzega teraz, że wybranie Core Lightning daje Mempool pełną kontrolę nad węzłem Core Lightning, łącznie z jego środkami.',
    fr_FR:
      'Activer Lightning avertit désormais que choisir Core Lightning donne à Mempool le contrôle total de votre nœud Core Lightning, y compris de ses fonds.',
  },
  migrations: {
    down: IMPOSSIBLE,
  },
})
