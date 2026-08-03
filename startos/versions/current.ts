import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.1:21',
  releaseNotes: {
    en_US: `Requires an up-to-date Bitcoin.

Mempool needs pruning disabled and the transaction index enabled on Bitcoin, and asks for that through settings older Bitcoin releases do not have. The version Mempool required did not rule those out, so on an out-of-date Bitcoin the Auto-Configure task opened a form that could not be submitted, and came back no matter what you did. Mempool now requires the current revision of whichever Bitcoin version line you are on, so an out-of-date Bitcoin is reported as needing an update instead.`,
    es_ES: `Exige un Bitcoin actualizado.

Mempool necesita que la poda esté desactivada y el índice de transacciones activado en Bitcoin, y lo solicita mediante ajustes que las versiones antiguas de Bitcoin no tienen. La versión que Mempool exigía no las descartaba, así que en un Bitcoin desactualizado la tarea Auto-Configurar abría un formulario que no se podía enviar y volvía a aparecer hiciera lo que hiciera. Ahora Mempool exige la revisión actual de la línea de versiones de Bitcoin que uses, de modo que un Bitcoin desactualizado se señala como pendiente de actualizar.`,
    de_DE: `Setzt ein aktuelles Bitcoin voraus.

Mempool benötigt Bitcoin ohne Pruning und mit aktiviertem Transaktionsindex und fordert das über Einstellungen an, die ältere Bitcoin-Ausgaben nicht haben. Die von Mempool geforderte Version schloss diese nicht aus, sodass auf einem veralteten Bitcoin die Aufgabe „Auto-Konfiguration“ ein Formular öffnete, das sich nicht absenden ließ, und immer wieder zurückkam. Mempool verlangt jetzt die aktuelle Revision der von dir genutzten Bitcoin-Versionsreihe, sodass ein veraltetes Bitcoin stattdessen als aktualisierungsbedürftig gemeldet wird.`,
    pl_PL: `Wymaga aktualnego Bitcoina.

Mempool wymaga wyłączonego przycinania i włączonego indeksu transakcji w Bitcoinie i prosi o to poprzez ustawienia, których starsze wydania Bitcoina nie mają. Wersja wymagana przez Mempool ich nie wykluczała, więc na nieaktualnym Bitcoinie zadanie Auto-Konfiguracja otwierało formularz, którego nie dało się wysłać, i wracało niezależnie od podjętych działań. Mempool wymaga teraz bieżącej rewizji tej linii wydań Bitcoina, z której korzystasz, więc nieaktualny Bitcoin jest zgłaszany jako wymagający aktualizacji.`,
    fr_FR: `Exige un Bitcoin à jour.

Mempool a besoin que l'élagage soit désactivé et l'index des transactions activé sur Bitcoin, et le demande via des réglages que les anciennes versions de Bitcoin n'ont pas. La version exigée par Mempool ne les excluait pas : sur un Bitcoin obsolète, la tâche Auto-Configuration ouvrait un formulaire impossible à envoyer et revenait quoi que vous fassiez. Mempool exige désormais la révision actuelle de la ligne de versions de Bitcoin que vous utilisez, de sorte qu'un Bitcoin obsolète est signalé comme devant être mis à jour.`,
  },
  migrations: {},
})
