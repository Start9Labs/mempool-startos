import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { configJson } from '../file-models/mempool-config.json'
import { PROFILES, DEFAULT_PROFILE } from '../utils'

export const v_3_3_1_4 = VersionInfo.of({
  version: '3.3.1:4',
  releaseNotes: {
    en_US: `**Features**

- The **Configure Indexing** action has been replaced with a broader **Indexing and Performance** action that combines performance, statistics, and indexing on a single form:
  - **Performance Profile** — three presets (Low-CPU / Balanced / Responsive) controlling how often the backend polls bitcoind and how many future blocks it projects. Low-CPU is the new default — recommended for low-power devices.
  - **Enable Statistics** — toggle the backend tx/s + vbytes/s sampler. Disable to cut background CPU and DB writes if you don't use the dashboard charts.
  - Indexing toggles unchanged (Block Summaries, Goggles, Audit, CPFP).

**Internal**

- New installs default to \`POLL_RATE_MS=8000\` and \`MEMPOOL_BLOCKS_AMOUNT=4\` (Low-CPU profile).
- Existing installs are migrated to the Low-CPU profile on upgrade. Run **Indexing and Performance** afterwards to pick Balanced or Responsive if you prefer.`,
    es_ES: `**Funciones**

- La acción **Configurar Indexación** se ha reemplazado por una acción más amplia **Indexación y Rendimiento** que combina rendimiento, estadísticas e indexación en un único formulario:
  - **Perfil de Rendimiento** — tres preajustes (Bajo Consumo CPU / Equilibrado / Responsivo) que controlan con qué frecuencia el backend consulta a bitcoind y cuántos bloques futuros proyecta. Bajo Consumo CPU es el nuevo valor predeterminado — recomendado para dispositivos de baja potencia.
  - **Habilitar Estadísticas** — alterna el muestreador de tx/s + vbytes/s del backend. Desactívelo para reducir CPU y escrituras en disco si no usa los gráficos del panel.
  - Las opciones de indexación no cambian (Resúmenes de Bloques, Goggles, Auditoría, CPFP).

**Interno**

- Nuevas instalaciones usan \`POLL_RATE_MS=8000\` y \`MEMPOOL_BLOCKS_AMOUNT=4\` (perfil Bajo Consumo CPU).
- Las instalaciones existentes se migran al perfil Bajo Consumo CPU al actualizar. Ejecute **Indexación y Rendimiento** después si prefiere Equilibrado o Responsivo.`,
    de_DE: `**Funktionen**

- Die Aktion **Indexierung konfigurieren** wurde durch die umfassendere Aktion **Indexierung und Leistung** ersetzt, die Leistung, Statistik und Indexierung in einem einzigen Formular vereint:
  - **Leistungsprofil** — drei Voreinstellungen (Niedrige-CPU / Ausgeglichen / Reaktionsschnell), die steuern, wie oft das Backend bitcoind abfragt und wie viele zukünftige Blöcke projiziert werden. Niedrige-CPU ist der neue Standard — empfohlen für leistungsschwache Geräte.
  - **Statistik aktivieren** — schaltet den tx/s + vbytes/s-Sampler des Backends um. Deaktivieren, um Hintergrund-CPU und DB-Schreibvorgänge zu reduzieren, wenn die Dashboard-Diagramme nicht genutzt werden.
  - Indexierungsoptionen unverändert (Blockzusammenfassungen, Goggles, Audit, CPFP).

**Intern**

- Neue Installationen verwenden \`POLL_RATE_MS=8000\` und \`MEMPOOL_BLOCKS_AMOUNT=4\` (Niedrige-CPU-Profil).
- Bestehende Installationen werden beim Upgrade auf das Niedrige-CPU-Profil migriert. Führen Sie anschließend **Indexierung und Leistung** aus, wenn Sie Ausgeglichen oder Reaktionsschnell bevorzugen.`,
    pl_PL: `**Funkcje**

- Akcja **Konfiguruj Indeksowanie** została zastąpiona szerszą akcją **Indeksowanie i Wydajność**, która łączy wydajność, statystyki i indeksowanie w jednym formularzu:
  - **Profil Wydajności** — trzy presety (Niska-CPU / Zbalansowany / Responsywny) kontrolujące częstotliwość odpytywania bitcoind i liczbę projektowanych przyszłych bloków. Niska-CPU jest nowym domyślnym — zalecane dla urządzeń o niskiej mocy.
  - **Włącz Statystyki** — przełącza sampler tx/s + vbytes/s w backendzie. Wyłącz, aby zmniejszyć użycie CPU i zapisów do bazy danych, jeśli nie korzystasz z wykresów panelu.
  - Opcje indeksowania bez zmian (Podsumowania Bloków, Goggles, Audyt, CPFP).

**Wewnętrzne**

- Nowe instalacje używają \`POLL_RATE_MS=8000\` i \`MEMPOOL_BLOCKS_AMOUNT=4\` (profil Niska-CPU).
- Istniejące instalacje są migrowane do profilu Niska-CPU przy aktualizacji. Uruchom następnie **Indeksowanie i Wydajność**, jeśli wolisz Zbalansowany lub Responsywny.`,
    fr_FR: `**Fonctionnalités**

- L'action **Configurer l'Indexation** a été remplacée par une action plus large **Indexation et Performances** qui combine performances, statistiques et indexation sur un seul formulaire :
  - **Profil de Performance** — trois préréglages (CPU Réduit / Équilibré / Réactif) qui contrôlent la fréquence des requêtes du backend vers bitcoind et le nombre de blocs futurs projetés. CPU Réduit est la nouvelle valeur par défaut — recommandé pour les appareils à faible puissance.
  - **Activer les Statistiques** — bascule l'échantillonneur tx/s + vbytes/s du backend. Désactivez-le pour réduire la CPU et les écritures en base de données si vous n'utilisez pas les graphiques du tableau de bord.
  - Les options d'indexation sont inchangées (Résumés de Blocs, Goggles, Audit, CPFP).

**Interne**

- Les nouvelles installations utilisent \`POLL_RATE_MS=8000\` et \`MEMPOOL_BLOCKS_AMOUNT=4\` (profil CPU Réduit).
- Les installations existantes sont migrées vers le profil CPU Réduit lors de la mise à niveau. Exécutez ensuite **Indexation et Performances** si vous préférez Équilibré ou Réactif.`,
  },
  migrations: {
    up: async ({ effects }) => {
      await configJson.merge(effects, { MEMPOOL: PROFILES[DEFAULT_PROFILE] })
    },
    down: IMPOSSIBLE,
  },
})
