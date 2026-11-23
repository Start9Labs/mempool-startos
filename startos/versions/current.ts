import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.2:10',
  releaseNotes: {
    en_US:
      "Adds rbitcoin on this server as an optional Bitcoin node and Electrum source. Bitcoin stays the default. Changing nodes now also clears the previous node's address, so a local RPC cookie is never sent to it.",
    es_ES:
      'Añade rbitcoin en este servidor como nodo Bitcoin y fuente Electrum opcionales. Bitcoin sigue siendo la opción predeterminada. Al cambiar de nodo ahora también se borra la dirección del nodo anterior, de modo que nunca se le envía una cookie RPC local.',
    de_DE:
      'Fügt rbitcoin auf diesem Server als optionalen Bitcoin-Knoten und Electrum-Quelle hinzu. Bitcoin bleibt die Standardeinstellung. Beim Knotenwechsel wird nun auch die Adresse des vorherigen Knotens gelöscht, sodass ein lokales RPC-Cookie nie an ihn gesendet wird.',
    pl_PL:
      'Dodaje rbitcoin na tym serwerze jako opcjonalny węzeł Bitcoin i źródło Electrum. Bitcoin pozostaje domyślny. Zmiana węzła usuwa teraz także adres poprzedniego węzła, dzięki czemu lokalne ciasteczko RPC nigdy nie jest do niego wysyłane.',
    fr_FR:
      "Ajoute rbitcoin sur ce serveur comme nœud Bitcoin et source Electrum optionnels. Bitcoin reste le choix par défaut. Changer de nœud efface désormais aussi l'adresse du nœud précédent, afin qu'un cookie RPC local ne lui soit jamais envoyé.",
  },
  migrations: {
    down: IMPOSSIBLE,
  },
})
