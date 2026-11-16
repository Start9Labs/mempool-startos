import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.2:6',
  releaseNotes: {
    en_US: `Mempool can now read from a Bitcoin node that is not on this server, and from an Electrum server that is not on this server.

- New "Bitcoin Node" action: keep the Bitcoin service on this server (the default, unchanged for existing installs) or enter the host, RPC port, username and password of a Bitcoin Core node you run elsewhere. While an external node is selected, the Bitcoin service is no longer a dependency and its cookie is not mounted.
- "Select Indexer" gains "External Electrum server": the host, port and TLS setting of an Electrs or Fulcrum you run elsewhere.
- Either node must still be archival with transaction indexing; an external Electrum server must index the same chain as the node.`,
    es_ES: `Mempool ahora puede leer de un nodo Bitcoin que no está en este servidor, y de un servidor Electrum que no está en este servidor.

- Nueva acción "Nodo Bitcoin": mantenga el servicio Bitcoin de este servidor (el valor por defecto, sin cambios para las instalaciones existentes) o introduzca el host, el puerto RPC, el usuario y la contraseña de un nodo Bitcoin Core que ejecute en otro lugar. Mientras haya un nodo externo seleccionado, el servicio Bitcoin deja de ser una dependencia y su cookie no se monta.
- "Seleccionar indexador" añade "Servidor Electrum externo": el host, el puerto y el ajuste TLS de un Electrs o Fulcrum que ejecute en otro lugar.
- En ambos casos el nodo debe seguir siendo de archivo con indexación de transacciones; un servidor Electrum externo debe indexar la misma cadena que el nodo.`,
    de_DE: `Mempool kann jetzt von einem Bitcoin-Knoten lesen, der nicht auf diesem Server läuft, und von einem Electrum-Server, der nicht auf diesem Server läuft.

- Neue Aktion "Bitcoin-Knoten": den Bitcoin-Dienst auf diesem Server behalten (die Vorgabe, für bestehende Installationen unverändert) oder Host, RPC-Port, Benutzername und Passwort eines Bitcoin-Core-Knotens eingeben, den Sie anderswo betreiben. Solange ein externer Knoten gewählt ist, ist der Bitcoin-Dienst keine Abhängigkeit mehr und sein Cookie wird nicht eingebunden.
- "Indexer auswählen" erhält "Externer Electrum-Server": Host, Port und TLS-Einstellung eines Electrs oder Fulcrum, den Sie anderswo betreiben.
- In beiden Fällen muss der Knoten weiterhin archivierend sein und Transaktionen indexieren; ein externer Electrum-Server muss dieselbe Chain indexieren wie der Knoten.`,
    pl_PL: `Mempool może teraz czytać z węzła Bitcoin, który nie znajduje się na tym serwerze, oraz z serwera Electrum, który nie znajduje się na tym serwerze.

- Nowa akcja "Węzeł Bitcoin": zachowaj usługę Bitcoin na tym serwerze (domyślnie, bez zmian dla istniejących instalacji) albo podaj host, port RPC, nazwę użytkownika i hasło węzła Bitcoin Core uruchomionego gdzie indziej. Gdy wybrany jest węzeł zewnętrzny, usługa Bitcoin przestaje być zależnością, a jej ciasteczko nie jest montowane.
- "Wybierz indekser" zyskuje opcję "Zewnętrzny serwer Electrum": host, port i ustawienie TLS Electrs lub Fulcrum uruchomionego gdzie indziej.
- W obu przypadkach węzeł nadal musi być archiwalny z indeksowaniem transakcji; zewnętrzny serwer Electrum musi indeksować ten sam łańcuch co węzeł.`,
    fr_FR: `Mempool peut désormais lire depuis un nœud Bitcoin qui n'est pas sur ce serveur, et depuis un serveur Electrum qui n'est pas sur ce serveur.

- Nouvelle action « Nœud Bitcoin » : conservez le service Bitcoin de ce serveur (le choix par défaut, inchangé pour les installations existantes) ou saisissez l'hôte, le port RPC, le nom d'utilisateur et le mot de passe d'un nœud Bitcoin Core que vous exploitez ailleurs. Tant qu'un nœud externe est sélectionné, le service Bitcoin n'est plus une dépendance et son cookie n'est pas monté.
- « Sélectionner l'indexeur » gagne « Serveur Electrum externe » : l'hôte, le port et le réglage TLS d'un Electrs ou d'un Fulcrum que vous exploitez ailleurs.
- Dans les deux cas, le nœud doit rester archival avec l'indexation des transactions ; un serveur Electrum externe doit indexer la même chaîne que le nœud.`,
  },
  migrations: {
    down: IMPOSSIBLE,
  },
})
