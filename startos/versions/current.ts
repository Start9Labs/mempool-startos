import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.1:24',
  releaseNotes: {
    en_US: `Mempool now asks which Electrum server to use for address lookups, and will not start until you answer.

Address lookups need Fulcrum or Electrs, and nothing is chosen for you; a new **None** option turns them off deliberately. If you were never asked, address search was not working — answering the task is how to turn it on.`,
    es_ES: `Mempool ahora pregunta qué servidor Electrum usar para las búsquedas de direcciones, y no arrancará hasta que responda.

Las búsquedas de direcciones necesitan Fulcrum o Electrs, y no se elige nada por usted; una nueva opción **Ninguno** las desactiva deliberadamente. Si nunca se le preguntó, la búsqueda de direcciones no funcionaba: responder a la tarea es cómo activarla.`,
    de_DE: `Mempool fragt jetzt, welcher Electrum-Server für Adressabfragen verwendet werden soll, und startet erst, wenn Sie antworten.

Adressabfragen brauchen Fulcrum oder Electrs, und es wird nichts für Sie ausgewählt; eine neue Option **Keiner** schaltet sie bewusst ab. Wurden Sie nie gefragt, funktionierte die Adresssuche nicht — die Aufgabe zu beantworten ist der Weg, sie einzuschalten.`,
    pl_PL: `Mempool pyta teraz, którego serwera Electrum użyć do wyszukiwania adresów, i nie uruchomi się, dopóki nie odpowiesz.

Wyszukiwanie adresów wymaga Fulcrum albo Electrs i nic nie jest wybierane za Ciebie; nowa opcja **Brak** wyłącza je świadomie. Jeśli nigdy nie zostałeś zapytany, wyszukiwanie adresów nie działało — odpowiedź na zadanie jest sposobem, by je włączyć.`,
    fr_FR: `Mempool demande désormais quel serveur Electrum utiliser pour les recherches d'adresses, et ne démarrera pas tant que vous n'aurez pas répondu.

Les recherches d'adresses nécessitent Fulcrum ou Electrs, et rien n'est choisi à votre place ; une nouvelle option **Aucun** les désactive délibérément. Si la question ne vous a jamais été posée, la recherche d'adresses ne fonctionnait pas — répondre à la tâche est le moyen de l'activer.`,
  },
  migrations: {
    down: IMPOSSIBLE,
  },
})
