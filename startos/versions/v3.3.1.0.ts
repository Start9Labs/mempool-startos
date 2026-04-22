import { IMPOSSIBLE, VersionInfo, YAML } from '@start9labs/start-sdk'
import { readFile, rm, writeFile } from 'fs/promises'
import { configJson } from '../file-models/mempool-config.json'

export const v_3_3_1_0 = VersionInfo.of({
  version: '3.3.1:0',
  releaseNotes: {
    en_US:
      'Updates Mempool to upstream v3.3.1, bringing Taproot script tree visualization, sighash highlighting, stale block comparisons, annex goggles, sub-1-sat/vB support, ephemeral dust, PSBT signature previews, decimal fee recommendations, and new API endpoints. Adds a new "Configure Indexing" action so you can opt in to block summaries, goggles, block audits, and CPFP indexing.',
    es_ES:
      'Actualiza Mempool a la version upstream v3.3.1, que incorpora visualizacion del arbol de scripts Taproot, resaltado de sighash, comparaciones de bloques obsoletos, goggles de annex, soporte para sub-1-sat/vB, dust efimero, vista previa de firmas PSBT, recomendaciones de tarifa decimales y nuevos endpoints de API. Anade una nueva accion "Configurar indexacion" para habilitar resumenes de bloques, goggles, auditorias de bloques e indexacion CPFP.',
    de_DE:
      'Aktualisiert Mempool auf Upstream v3.3.1 mit Visualisierung des Taproot-Skriptbaums, Sighash-Hervorhebung, Vergleichen veralteter Bloecke, Annex-Goggles, Sub-1-Sat/vB-Unterstuetzung, kurzlebigem Dust, PSBT-Signaturvorschau, dezimalen Gebuehrenempfehlungen und neuen API-Endpunkten. Fuegt eine neue Aktion "Indexierung konfigurieren" hinzu, um Blockzusammenfassungen, Goggles, Block-Audits und CPFP-Indexierung zu aktivieren.',
    pl_PL:
      'Aktualizuje Mempool do wersji upstream v3.3.1 z wizualizacja drzewa skryptu Taproot, podswietlaniem sighash, porownywaniem blokow nieaktualnych, goglami annex, obsluga sub-1-sat/vB, efemerycznym pylem, podgladem podpisow PSBT, dziesietnymi rekomendacjami oplat i nowymi endpointami API. Dodaje nowa akcje "Konfiguruj indeksowanie" umozliwiajaca wlaczenie podsumowan blokow, gogli, audytow blokow i indeksowania CPFP.',
    fr_FR:
      "Met a jour Mempool vers la version upstream v3.3.1 avec visualisation de l'arbre de script Taproot, surlignage sighash, comparaisons de blocs obsoletes, goggles annex, prise en charge sub-1-sat/vB, poussiere ephemere, apercu des signatures PSBT, recommandations de frais decimales et nouveaux endpoints API. Ajoute une nouvelle action 'Configurer l'indexation' permettant d'activer les resumes de blocs, goggles, audits de blocs et indexation CPFP.",
  },
  migrations: {
    up: async ({ effects }) => {
      // migrate from 0351 config.yaml if present
      const configYaml:
        | {
            'enable-electrs'?: boolean
            indexer?: {
              type: 'electrs' | 'fulcrum' | 'none'
            }
            lightning: {
              type: 'cln' | 'lnd' | 'none'
            }
          }
        | undefined = await readFile(
        '/media/startos/volumes/main/start9/config.yaml',
        'utf-8',
      ).then(YAML.parse, () => undefined)

      if (configYaml) {
        const { lightning, indexer } = configYaml

        const custom: {
          DATABASE?: { PASSWORD: string }
          LIGHTNING?: { ENABLED: boolean; BACKEND?: 'lnd' | 'cln' }
          MEMPOOL?: { BACKEND: 'electrum' }
          ELECTRUM?: {
            HOST: 'electrs.startos' | 'fulcrum.startos'
            PORT: number
            TLS_ENABLED: boolean
          }
        } = { DATABASE: { PASSWORD: 'mempool' } }

        if (lightning && lightning.type !== 'none') {
          custom.LIGHTNING = { ENABLED: true, BACKEND: lightning.type }
        } else {
          custom.LIGHTNING = { ENABLED: false }
        }

        if (
          configYaml['enable-electrs'] ||
          (indexer &&
            (indexer.type === 'electrs' || indexer.type === 'fulcrum'))
        ) {
          custom.MEMPOOL = { BACKEND: 'electrum' }
          custom.ELECTRUM = {
            HOST:
              indexer?.type === 'fulcrum'
                ? 'fulcrum.startos'
                : 'electrs.startos',
            PORT: 50001,
            TLS_ENABLED: false,
          }
        }

        await configJson.merge(effects, custom)

        // Write healthcheck credentials so the official MariaDB image's
        // healthcheck.sh can authenticate. The 0.3.5.1 entrypoint set root
        // to unix_socket auth, which the new image's healthcheck can't use.
        // Format mirrors upstream create_healthcheck_users().
        await writeFile(
          '/media/startos/volumes/db/.my-healthcheck.cnf',
          '[mariadb-client]\nport=3306\nsocket=/run/mysqld/mysqld.sock\nuser=mempool\npassword=mempool\nprotocol=tcp\n',
          { mode: 0o600 },
        ).catch(console.error)

        // remove old start9 dir
        rm('/media/startos/volumes/main/start9', {
          recursive: true,
        }).catch(console.error)
      }
    },
    down: IMPOSSIBLE,
  },
})
