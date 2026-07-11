import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.1:15',
  releaseNotes: {
    en_US: `Fixes backups failing on installs with database indexing enabled. Backups now capture only your Mempool configuration; on restore, Mempool rebuilds its database by re-indexing from Bitcoin Core, so historical charts fill in over the following hours.`,
    es_ES: `Corrige los fallos de copia de seguridad en instalaciones con la indexacion de base de datos activada. Las copias de seguridad ahora guardan solo tu configuracion de Mempool; al restaurar, Mempool reconstruye su base de datos reindexando desde Bitcoin Core, por lo que los graficos historicos se completan durante las horas siguientes.`,
    de_DE: `Behebt fehlgeschlagene Sicherungen auf Installationen mit aktivierter Datenbank-Indizierung. Sicherungen erfassen jetzt nur noch deine Mempool-Konfiguration; bei der Wiederherstellung baut Mempool seine Datenbank durch erneutes Indizieren aus Bitcoin Core neu auf, sodass sich die historischen Diagramme in den folgenden Stunden fuellen.`,
    pl_PL: `Naprawia nieudane kopie zapasowe na instalacjach z wlaczonym indeksowaniem bazy danych. Kopie zapasowe zapisuja teraz tylko twoja konfiguracje Mempool; podczas przywracania Mempool odbudowuje baze danych, indeksujac ponownie z Bitcoin Core, dzieki czemu historyczne wykresy uzupelniaja sie w ciagu kolejnych godzin.`,
    fr_FR: `Corrige les echecs de sauvegarde sur les installations avec l'indexation de base de donnees activee. Les sauvegardes ne capturent desormais que votre configuration Mempool; lors de la restauration, Mempool reconstruit sa base de donnees en la reindexant depuis Bitcoin Core, de sorte que les graphiques historiques se remplissent au cours des heures suivantes.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
