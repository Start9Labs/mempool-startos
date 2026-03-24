import { IMPOSSIBLE, VersionInfo, YAML } from '@start9labs/start-sdk'
import { readFile, rm } from 'fs/promises'
import { configJson } from '../../file-models/mempool-config.json'

export const v_3_2_1_8_b3 = VersionInfo.of({
  version: '3.2.1:8-beta.3',
  releaseNotes: {
    en_US:
      'Fixed database migration from 0.3.5.1, consolidated dependency tasks, and fixed nginx log permissions.',
    es_ES:
      'Se corrigio la migracion de la base de datos desde 0.3.5.1, se consolidaron las tareas de dependencias y se corrigieron los permisos de los registros de nginx.',
    de_DE:
      'Datenbankmigration von 0.3.5.1 behoben, Abhangigkeitsaufgaben konsolidiert und nginx-Protokollberechtigungen korrigiert.',
    pl_PL:
      'Naprawiono migracje bazy danych z 0.3.5.1, skonsolidowano zadania zaleznosci i naprawiono uprawnienia logow nginx.',
    fr_FR:
      'Correction de la migration de la base de donnees depuis 0.3.5.1, consolidation des taches de dependances et correction des permissions des journaux nginx.',
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
          // 0351 used hardcoded password 'mempool'
          PASSWORD: 'mempool'
        } = { PASSWORD: 'mempool' }

        if (lightning && lightning.type !== 'none') {
          custom.LIGHTNING = { ENABLED: true, BACKEND: lightning.type }
        } else {
          custom.LIGHTNING = { ENABLED: false }
        }

        if (
          configYaml['enable-electrs'] ||
          (indexer && (indexer.type === 'electrs' || indexer.type === 'fulcrum'))
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

        // remove old start9 dir
        rm('/media/startos/volumes/main/start9', {
          recursive: true,
        }).catch(console.error)
      } else {
        await configJson.merge(effects, {})
      }
    },
    down: IMPOSSIBLE,
  },
})
