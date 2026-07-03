import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.1:14',
  releaseNotes: {
    en_US: `- Fix a startup crash loop ("JavaScript heap out of memory") on hosts with around 16 GB of RAM, where the backend heap ceiling was pinned at 2 GB regardless of host RAM, too low to reload a large mempool disk cache. The ceiling now scales with host RAM, the backend automatically drops a cache it cannot load and rebuilds it from live data instead of looping, and a new "Clear Backend Cache" action can reset a stuck backend by hand.`,
    es_ES: `- Corrige un bucle de fallos de inicio ("JavaScript heap out of memory") en equipos con alrededor de 16 GB de RAM, donde el limite de memoria del backend estaba fijado en 2 GB independientemente de la RAM del equipo, demasiado bajo para recargar una cache de mempool grande. El limite ahora escala con la RAM del equipo, el backend descarta automaticamente una cache que no puede cargar y la reconstruye a partir de datos en vivo en lugar de entrar en bucle, y una nueva accion "Borrar cache del backend" permite reiniciar manualmente un backend bloqueado.`,
    de_DE: `- Behebt eine Startabsturzschleife ("JavaScript heap out of memory") auf Systemen mit rund 16 GB Arbeitsspeicher, bei denen das Backend-Speicherlimit unabhaengig vom Arbeitsspeicher auf 2 GB festgelegt war und damit zu niedrig, um einen grossen Mempool-Festplatten-Cache neu zu laden. Das Limit skaliert nun mit dem Arbeitsspeicher, das Backend verwirft automatisch einen nicht ladbaren Cache und baut ihn aus Live-Daten neu auf, anstatt in einer Schleife zu haengen, und eine neue Aktion "Backend-Cache leeren" kann ein blockiertes Backend manuell zuruecksetzen.`,
    pl_PL: `- Naprawia petle awarii uruchamiania ("JavaScript heap out of memory") na urzadzeniach z okolo 16 GB pamieci RAM, gdzie limit pamieci backendu byl ustawiony na 2 GB niezaleznie od pamieci RAM urzadzenia, zbyt nisko, aby ponownie zaladowac duza pamiec podreczna mempool. Limit teraz skaluje sie z pamiecia RAM urzadzenia, backend automatycznie odrzuca pamiec podreczna, ktorej nie moze zaladowac, i odbudowuje ja z danych na zywo zamiast wpadac w petle, a nowa akcja "Wyczysc pamiec podreczna backendu" pozwala recznie zresetowac zablokowany backend.`,
    fr_FR: `- Corrige une boucle de plantage au demarrage ("JavaScript heap out of memory") sur les hotes disposant d'environ 16 Go de RAM, ou le plafond de memoire du backend etait fixe a 2 Go quelle que soit la RAM de l'hote, trop bas pour recharger un grand cache de mempool sur disque. Le plafond evolue desormais avec la RAM de l'hote, le backend abandonne automatiquement un cache qu'il ne peut pas charger et le reconstruit a partir de donnees en direct au lieu de boucler, et une nouvelle action "Vider le cache du backend" permet de reinitialiser manuellement un backend bloque.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
