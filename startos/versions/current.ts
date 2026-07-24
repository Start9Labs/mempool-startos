import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.1:19',
  releaseNotes: {
    en_US: `Keeps the Bitcoin and LND connection working when Bitcoin and LND changes how it serves TLS.

Mempool resolved Bitcoin and LND's address from a field that is only populated for one of the two ways a service can publish a port. It now reads the address itself, which is correct either way — so the connection survives Bitcoin and LND's next update instead of going unreachable.`,
    es_ES: `Mantiene la conexión con Bitcoin and LND cuando Bitcoin and LND cambia su forma de servir TLS.

Mempool resolvía la dirección de Bitcoin and LND a partir de un campo que solo se rellena en una de las dos formas en que un servicio puede publicar un puerto. Ahora lee la dirección en sí, que es correcta en ambos casos, así que la conexión sobrevive a la próxima actualización de Bitcoin and LND en lugar de quedar inaccesible.`,
    de_DE: `Hält die Bitcoin and LND-Verbindung aufrecht, wenn Bitcoin and LND die Art der TLS-Bereitstellung ändert.

Mempool ermittelte die Adresse von Bitcoin and LND aus einem Feld, das nur bei einer der beiden Arten gefüllt ist, auf die ein Dienst einen Port veröffentlichen kann. Jetzt wird die Adresse selbst gelesen, die in beiden Fällen stimmt — die Verbindung übersteht damit das nächste Bitcoin and LND-Update, statt unerreichbar zu werden.`,
    pl_PL: `Utrzymuje połączenie z Bitcoin and LND, gdy Bitcoin and LND zmienia sposób udostępniania TLS.

Mempool ustalał adres Bitcoin and LND na podstawie pola wypełnianego tylko przy jednym z dwóch sposobów publikowania portu przez usługę. Teraz odczytuje sam adres, poprawny w obu przypadkach — dzięki temu połączenie przetrwa kolejną aktualizację Bitcoin and LND, zamiast stać się nieosiągalne.`,
    fr_FR: `Maintient la connexion à Bitcoin and LND lorsque Bitcoin and LND change sa façon de servir TLS.

Mempool déterminait l'adresse de Bitcoin and LND à partir d'un champ renseigné dans un seul des deux modes de publication d'un port par un service. Il lit désormais l'adresse elle-même, correcte dans les deux cas — la connexion survit donc à la prochaine mise à jour de Bitcoin and LND au lieu de devenir injoignable.`,
  },
  migrations: {},
})
