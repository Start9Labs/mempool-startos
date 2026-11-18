import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.2:6',
  releaseNotes: {
    en_US: `Mempool can now read from a Bitcoin node that is not on this server, and from an Electrum server that is not on this server.

- New "Bitcoin Node" action: keep the Bitcoin service on this server (the default, unchanged for existing installs) or enter the host, RPC port, username and password of a Bitcoin Core node you run elsewhere. While an external node is selected, the Bitcoin service is no longer a dependency and its cookie is not mounted.
- "Select Indexer" gains "External Electrum server": the host, port and TLS setting of an Electrs or Fulcrum you run elsewhere.
- Either node must still be archival with transaction indexing; an external Electrum server must index the same chain as the node.
- While an external node is selected, an "External node" health check asks it directly and says whether it is unreachable, rejects the credentials, is pruned, lacks txindex, or is still syncing. The form notes that RPC is plain HTTP: keep the node on your local network.
- Update Bitcoin first: with Bitcoin on this server, Mempool can now read only Bitcoin's RPC credential, not its data directory or wallets.`,
    es_ES: `Mempool ahora puede leer de un nodo Bitcoin que no está en este servidor, y de un servidor Electrum que no está en este servidor.

- Nueva acción "Nodo Bitcoin": mantenga el servicio Bitcoin de este servidor (el valor por defecto, sin cambios para las instalaciones existentes) o introduzca el host, el puerto RPC, el usuario y la contraseña de un nodo Bitcoin Core que ejecute en otro lugar. Mientras haya un nodo externo seleccionado, el servicio Bitcoin deja de ser una dependencia y su cookie no se monta.
- "Seleccionar indexador" añade "Servidor Electrum externo": el host, el puerto y el ajuste TLS de un Electrs o Fulcrum que ejecute en otro lugar.
- En ambos casos el nodo debe seguir siendo de archivo con indexación de transacciones; un servidor Electrum externo debe indexar la misma cadena que el nodo.
- Mientras haya un nodo externo seleccionado, una comprobación de salud "Nodo externo" le pregunta directamente e indica si es inalcanzable, rechaza las credenciales, está podado, carece de txindex o aún se sincroniza. El formulario advierte que RPC va por HTTP sin cifrar: mantenga el nodo en su red local.
- Actualiza Bitcoin primero: con el Bitcoin de este servidor, Mempool ahora solo puede leer la credencial RPC de Bitcoin, no su directorio de datos ni sus billeteras.`,
    de_DE: `Mempool kann jetzt von einem Bitcoin-Knoten lesen, der nicht auf diesem Server läuft, und von einem Electrum-Server, der nicht auf diesem Server läuft.

- Neue Aktion "Bitcoin-Knoten": den Bitcoin-Dienst auf diesem Server behalten (die Vorgabe, für bestehende Installationen unverändert) oder Host, RPC-Port, Benutzername und Passwort eines Bitcoin-Core-Knotens eingeben, den Sie anderswo betreiben. Solange ein externer Knoten gewählt ist, ist der Bitcoin-Dienst keine Abhängigkeit mehr und sein Cookie wird nicht eingebunden.
- "Indexer auswählen" erhält "Externer Electrum-Server": Host, Port und TLS-Einstellung eines Electrs oder Fulcrum, den Sie anderswo betreiben.
- In beiden Fällen muss der Knoten weiterhin archivierend sein und Transaktionen indexieren; ein externer Electrum-Server muss dieselbe Chain indexieren wie der Knoten.
- Solange ein externer Knoten gewählt ist, fragt ihn eine Gesundheitsprüfung "Externer Knoten" direkt ab und meldet, ob er unerreichbar ist, die Zugangsdaten ablehnt, beschnitten ist, keinen txindex hat oder noch synchronisiert. Das Formular weist darauf hin, dass RPC unverschlüsseltes HTTP ist: Knoten im lokalen Netzwerk belassen.
- Aktualisiere zuerst Bitcoin: Mit dem Bitcoin auf diesem Server kann Mempool jetzt nur noch die RPC-Zugangsdaten von Bitcoin lesen, nicht sein Datenverzeichnis oder seine Wallets.`,
    pl_PL: `Mempool może teraz czytać z węzła Bitcoin, który nie znajduje się na tym serwerze, oraz z serwera Electrum, który nie znajduje się na tym serwerze.

- Nowa akcja "Węzeł Bitcoin": zachowaj usługę Bitcoin na tym serwerze (domyślnie, bez zmian dla istniejących instalacji) albo podaj host, port RPC, nazwę użytkownika i hasło węzła Bitcoin Core uruchomionego gdzie indziej. Gdy wybrany jest węzeł zewnętrzny, usługa Bitcoin przestaje być zależnością, a jej ciasteczko nie jest montowane.
- "Wybierz indekser" zyskuje opcję "Zewnętrzny serwer Electrum": host, port i ustawienie TLS Electrs lub Fulcrum uruchomionego gdzie indziej.
- W obu przypadkach węzeł nadal musi być archiwalny z indeksowaniem transakcji; zewnętrzny serwer Electrum musi indeksować ten sam łańcuch co węzeł.
- Gdy wybrany jest węzeł zewnętrzny, kontrola stanu "Węzeł zewnętrzny" odpytuje go bezpośrednio i mówi, czy jest nieosiągalny, odrzuca poświadczenia, jest przycięty, nie ma txindex lub wciąż się synchronizuje. Formularz zaznacza, że RPC to nieszyfrowany HTTP: trzymaj węzeł w sieci lokalnej.
- Najpierw zaktualizuj Bitcoin: przy Bitcoinie na tym serwerze Mempool może teraz odczytać tylko poświadczenie RPC Bitcoina, a nie jego katalog danych ani portfele.`,
    fr_FR: `Mempool peut désormais lire depuis un nœud Bitcoin qui n'est pas sur ce serveur, et depuis un serveur Electrum qui n'est pas sur ce serveur.

- Nouvelle action « Nœud Bitcoin » : conservez le service Bitcoin de ce serveur (le choix par défaut, inchangé pour les installations existantes) ou saisissez l'hôte, le port RPC, le nom d'utilisateur et le mot de passe d'un nœud Bitcoin Core que vous exploitez ailleurs. Tant qu'un nœud externe est sélectionné, le service Bitcoin n'est plus une dépendance et son cookie n'est pas monté.
- « Sélectionner l'indexeur » gagne « Serveur Electrum externe » : l'hôte, le port et le réglage TLS d'un Electrs ou d'un Fulcrum que vous exploitez ailleurs.
- Dans les deux cas, le nœud doit rester archival avec l'indexation des transactions ; un serveur Electrum externe doit indexer la même chaîne que le nœud.
- Tant qu'un nœud externe est sélectionné, un contrôle de santé « Nœud externe » l'interroge directement et indique s'il est injoignable, refuse les identifiants, est élagué, n'a pas de txindex ou se synchronise encore. Le formulaire précise que le RPC est en HTTP non chiffré : gardez le nœud sur votre réseau local.
- Mettez d'abord Bitcoin à jour : avec le Bitcoin de ce serveur, Mempool ne peut désormais lire que l'identifiant RPC de Bitcoin, et non son répertoire de données ni ses portefeuilles.`,
  },
  migrations: {
    down: IMPOSSIBLE,
  },
})
