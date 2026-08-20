import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { configJson } from '../file-models/mempool-config.json'
import { sdk } from '../sdk'
import { EXTERNAL_RETRY } from '../utils'

export const current = VersionInfo.of({
  version: '3.3.1:23',
  releaseNotes: {
    en_US: `Mempool no longer needs GitHub in order to start (issue #74).

The backend refuses to start without mining pool definitions, and it fetched those from GitHub the first time it ran. On a server whose containers cannot reach the internet — a VPN gateway that left them without a resolver, a censored network — a fresh install could therefore never start, and reinstalling, the obvious thing to try, was the one action that made the failure permanent. A snapshot of that data now ships inside the package and is served locally, so a first start needs no network at all.

- New "Route External Requests Over Tor" action: sends fiat exchange rates, mining pool updates, and external data server requests through the Tor service on your server. Tor must be installed and running while it is on.
- When your server cannot resolve external hostnames, Mempool now says so in its log rather than leaving it to be inferred from a crash loop.
- External requests are retried a few times instead of once.
- After a start that never became ready, the log no longer blames memory for a failure it did not diagnose, and no longer announces clearing a cache that was already empty.`,
    es_ES: `Mempool ya no necesita GitHub para arrancar (issue #74).

El backend se niega a arrancar sin las definiciones de pools de minería, y las descargaba de GitHub la primera vez que se ejecutaba. En un servidor cuyos contenedores no pueden alcanzar internet —una pasarela VPN que los dejó sin resolutor, una red censurada— una instalación nueva nunca podía arrancar, y reinstalar, lo más obvio que intentar, era justo la acción que hacía permanente el fallo. Ahora el paquete incluye una copia de esos datos y la sirve localmente, así que un primer arranque no necesita red alguna.

- Nueva acción "Enrutar las solicitudes externas por Tor": envía los tipos de cambio fiat, las actualizaciones de pools de minería y las solicitudes al servidor de datos externo a través del servicio Tor de su servidor. Mientras esté activada, Tor debe estar instalado y en ejecución.
- Cuando su servidor no puede resolver nombres de host externos, Mempool ahora lo indica en el registro en lugar de dejar que se deduzca de un bucle de fallos.
- Las solicitudes externas se reintentan varias veces en lugar de una sola.
- Tras un arranque que nunca llegó a estar listo, el registro ya no culpa a la memoria de un fallo que no diagnosticó, ni anuncia el borrado de una caché que ya estaba vacía.`,
    de_DE: `Mempool benötigt zum Starten kein GitHub mehr (Issue #74).

Das Backend startet nicht ohne Mining-Pool-Definitionen, und es holte sie beim ersten Lauf von GitHub. Auf einem Server, dessen Container das Internet nicht erreichen — ein VPN-Gateway, das sie ohne Resolver zurückließ, ein zensiertes Netz —, konnte eine Neuinstallation daher nie starten, und eine erneute Installation, das Naheliegendste, war genau die Aktion, die den Fehler dauerhaft machte. Eine Momentaufnahme dieser Daten liegt jetzt im Paket und wird lokal ausgeliefert, sodass ein erster Start gar kein Netz braucht.

- Neue Aktion "Externe Anfragen über Tor leiten": sendet Fiat-Wechselkurse, Mining-Pool-Aktualisierungen und Anfragen an den externen Datenserver über den Tor-Dienst auf Ihrem Server. Solange sie aktiv ist, muss Tor installiert sein und laufen.
- Kann Ihr Server externe Hostnamen nicht auflösen, sagt Mempool das nun im Protokoll, statt es aus einer Neustartschleife erschließen zu lassen.
- Externe Anfragen werden mehrfach statt nur einmal versucht.
- Nach einem Start, der nie bereit wurde, gibt das Protokoll nicht mehr dem Speicher die Schuld an einem Fehler, den es nicht diagnostiziert hat, und kündigt auch nicht mehr das Leeren eines bereits leeren Caches an.`,
    pl_PL: `Mempool nie potrzebuje już GitHuba, aby wystartować (issue #74).

Backend nie uruchomi się bez definicji pul wydobywczych, a pobierał je z GitHuba przy pierwszym uruchomieniu. Na serwerze, którego kontenery nie mają dostępu do internetu — brama VPN, która zostawiła je bez resolvera, sieć objęta cenzurą — świeża instalacja nigdy nie mogła wystartować, a ponowna instalacja, czyli rzecz najbardziej oczywista, była dokładnie tym działaniem, które utrwalało awarię. Kopia tych danych jest teraz dołączona do pakietu i serwowana lokalnie, więc pierwszy start nie potrzebuje sieci w ogóle.

- Nowa akcja "Kieruj zapytania zewnętrzne przez Tora": wysyła kursy walut fiat, aktualizacje pul wydobywczych i zapytania do zewnętrznego serwera danych przez usługę Tor na twoim serwerze. Dopóki jest włączona, Tor musi być zainstalowany i działać.
- Gdy twój serwer nie potrafi rozwiązać zewnętrznych nazw hostów, Mempool mówi o tym w dzienniku, zamiast pozostawiać to do wywnioskowania z pętli awarii.
- Zapytania zewnętrzne są ponawiane kilka razy zamiast tylko raz.
- Po starcie, który nigdy nie osiągnął gotowości, dziennik nie obwinia już pamięci za awarię, której nie zdiagnozował, ani nie ogłasza czyszczenia pamięci podręcznej, która i tak była pusta.`,
    fr_FR: `Mempool n'a plus besoin de GitHub pour démarrer (issue #74).

Le backend refuse de démarrer sans les définitions des pools de minage, et il les récupérait sur GitHub lors de sa première exécution. Sur un serveur dont les conteneurs ne peuvent pas atteindre internet — une passerelle VPN qui les a laissés sans résolveur, un réseau censuré —, une installation neuve ne pouvait donc jamais démarrer, et réinstaller, le réflexe le plus évident, était précisément l'action qui rendait la panne définitive. Une copie de ces données est désormais incluse dans le paquet et servie localement : un premier démarrage ne nécessite aucun réseau.

- Nouvelle action "Acheminer les requêtes externes via Tor" : envoie les taux de change fiat, les mises à jour des pools de minage et les requêtes au serveur de données externe via le service Tor de votre serveur. Tant qu'elle est active, Tor doit être installé et en cours d'exécution.
- Lorsque votre serveur ne parvient pas à résoudre les noms d'hôtes externes, Mempool le signale désormais dans le journal au lieu de le laisser deviner à partir d'une boucle de redémarrages.
- Les requêtes externes sont réessayées plusieurs fois au lieu d'une seule.
- Après un démarrage qui n'a jamais abouti, le journal n'accuse plus la mémoire d'une panne qu'il n'a pas diagnostiquée, et n'annonce plus le vidage d'un cache déjà vide.`,
  },
  migrations: {
    up: async ({ effects }) => {
      // The file model's defaults only reach missing or invalid keys, and an
      // older install already holds a valid EXTERNAL_MAX_RETRY of 1.
      await configJson.merge(effects, { MEMPOOL: EXTERNAL_RETRY })
      // Replay keys left behind by bitcoind's two config-action renames. They
      // still demand `prune: 0, txindex: true`, so they collide the moment
      // Mempool asks bitcoind for anything else (issue #73). clearTask filters
      // by id, so an install that never wrote them is unaffected.
      await sdk.action.clearTask(
        effects,
        'bitcoind:config',
        'bitcoind:other-config',
      )
    },
    down: IMPOSSIBLE,
  },
})
