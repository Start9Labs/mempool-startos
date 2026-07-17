import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.1:18',
  releaseNotes: {
    en_US: `Makes the indexing backfill visible in the service log (issue #63). Previously, enabling Block Summaries, Goggles, Audit, or CPFP indexing started a multi-hour historical backfill that produced no log output at the default log level, making a healthy backfill look like a stalled sync.

- New "Log Level" setting in the Indexing and Performance action: switch to Debug to watch per-block backfill progress, then back to Info to quiet the log.
- On every start with an indexing feature enabled, Mempool now logs that a backfill may be in progress, that intermittent 503 retry errors from Bitcoin Core are expected and non-fatal, and that restarting the service delays completion.

Mempool itself is unchanged at 3.3.1.`,
    es_ES: `Hace visible el llenado histórico de indexación en el registro del servicio (issue #63). Anteriormente, activar la indexación de resúmenes de bloques, Goggles, auditoría o CPFP iniciaba un llenado histórico de varias horas que no producía ninguna salida en el registro con el nivel predeterminado, haciendo que un llenado sano pareciera una sincronización detenida.

- Nuevo ajuste "Nivel de registro" en la acción Indexación y rendimiento: cambie a Debug para observar el progreso por bloque del llenado y vuelva a Info para silenciar el registro.
- En cada arranque con una función de indexación activada, Mempool ahora registra que un llenado puede estar en curso, que los errores 503 intermitentes de reintento de Bitcoin Core son esperados y no fatales, y que reiniciar el servicio retrasa su finalización.

Mempool en sí se mantiene sin cambios en la versión 3.3.1.`,
    de_DE: `Macht den Indexierungs-Abgleich im Dienstprotokoll sichtbar (Issue #63). Bisher startete das Aktivieren der Blockzusammenfassungs-, Goggles-, Audit- oder CPFP-Indexierung einen mehrstündigen historischen Abgleich, der auf der Standard-Protokollstufe keinerlei Ausgabe erzeugte, sodass ein gesunder Abgleich wie eine hängende Synchronisierung aussah.

- Neue Einstellung "Protokollstufe" in der Aktion Indexierung und Leistung: Wechseln Sie zu Debug, um den blockweisen Abgleichfortschritt zu verfolgen, und danach zurück zu Info, um das Protokoll zu beruhigen.
- Bei jedem Start mit aktivierter Indexierungsfunktion protokolliert Mempool nun, dass ein Abgleich laufen kann, dass zeitweilige 503-Wiederholungsfehler von Bitcoin Core zu erwarten und nicht fatal sind, und dass ein Neustart des Dienstes den Abschluss verzögert.

Mempool selbst bleibt unverändert bei 3.3.1.`,
    pl_PL: `Sprawia, że historyczne uzupełnienie indeksowania jest widoczne w dzienniku usługi (issue #63). Wcześniej włączenie indeksowania podsumowań bloków, Goggles, audytu lub CPFP uruchamiało wielogodzinne historyczne uzupełnienie, które nie generowało żadnych wpisów w dzienniku na domyślnym poziomie, przez co zdrowe uzupełnienie wyglądało jak zawieszona synchronizacja.

- Nowe ustawienie "Poziom logowania" w akcji Indeksowanie i wydajność: przełącz na Debug, aby obserwować postęp uzupełniania dla poszczególnych bloków, a potem wróć do Info, aby wyciszyć dziennik.
- Przy każdym starcie z włączoną funkcją indeksowania Mempool loguje teraz, że uzupełnienie może być w toku, że sporadyczne błędy 503 z ponownymi próbami od Bitcoin Core są oczekiwane i niekrytyczne, oraz że ponowne uruchomienie usługi opóźnia jego zakończenie.

Sam Mempool pozostaje bez zmian w wersji 3.3.1.`,
    fr_FR: `Rend le remplissage historique d'indexation visible dans le journal du service (issue #63). Auparavant, l'activation de l'indexation des résumés de blocs, Goggles, audit ou CPFP lançait un remplissage historique de plusieurs heures qui ne produisait aucune sortie dans le journal au niveau par défaut, faisant passer un remplissage sain pour une synchronisation bloquée.

- Nouveau réglage "Niveau de journalisation" dans l'action Indexation et performances : passez à Debug pour suivre la progression bloc par bloc du remplissage, puis revenez à Info pour calmer le journal.
- À chaque démarrage avec une fonction d'indexation activée, Mempool journalise désormais qu'un remplissage peut être en cours, que les erreurs 503 intermittentes de nouvelle tentative de Bitcoin Core sont attendues et non fatales, et que redémarrer le service retarde son achèvement.

Mempool lui-même reste inchangé en version 3.3.1.`,
  },
  migrations: {
    // No data migration needed: STDOUT_LOG_MIN_PRIORITY already exists in
    // mempool-config.json (previously pinned to 'info'), and the file model's
    // .catch('info') heals any config predating the corrected enum on the
    // first read.
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
