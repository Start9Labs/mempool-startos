import { VersionInfo, IMPOSSIBLE, YAML } from '@start9labs/start-sdk'
import { readFile, rm } from 'fs/promises'
import { configJson } from '../../file-models/mempool-config.json'
import { getDbPassword } from '../../utils'

export const v_3_2_1_5_b0 = VersionInfo.of({
  version: '3.2.1:5-beta.0',
  releaseNotes: {
    en_US:
      'Added internationalization support and improved security by auto-generating database passwords.',
    es_ES:
      'Se agrego soporte de internacionalizacion y se mejoro la seguridad generando automaticamente las contrasenas de la base de datos.',
    de_DE:
      'Internationalisierungsunterstutzung hinzugefugt und verbesserte Sicherheit durch automatische Generierung von Datenbankpasswortern.',
    pl_PL:
      'Dodano wsparcie dla internacjonalizacji i poprawiono bezpieczenstwo poprzez automatyczne generowanie hasel do bazy danych.',
    fr_FR:
      "Ajout du support d'internationalisation et amelioration de la securite par la generation automatique des mots de passe de base de donnees.",
  },
  migrations: {
    up: async ({ effects }) => {
      const custom: {
        LIGHTNING?: { ENABLED: boolean; BACKEND?: 'lnd' | 'cln' }
        MEMPOOL?: { BACKEND: 'electrum' }
        ELECTRUM?: {
          HOST: 'electrs.startos' | 'fulcrum.startos'
          PORT: number
          TLS_ENABLED: boolean
        }
      } = {}

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

        if (lightning && lightning.type !== 'none') {
          custom.LIGHTNING = { ENABLED: true, BACKEND: lightning.type }
        } else {
          custom.LIGHTNING = { ENABLED: false }
        }

        if (configYaml['enable-electrs']) {
          custom.MEMPOOL = { BACKEND: 'electrum' }
          custom.ELECTRUM = {
            HOST: 'electrs.startos',
            PORT: 50001,
            TLS_ENABLED: false,
          }
        } else if (indexer && indexer.type === 'electrs') {
          custom.MEMPOOL = { BACKEND: 'electrum' }
          custom.ELECTRUM = {
            HOST: 'electrs.startos',
            PORT: 50001,
            TLS_ENABLED: false,
          }
        } else if (indexer && indexer.type === 'fulcrum') {
          custom.MEMPOOL = { BACKEND: 'electrum' }
          custom.ELECTRUM = {
            HOST: 'fulcrum.startos',
            PORT: 50001,
            TLS_ENABLED: false,
          }
        }

        // remove old start9 dir
        rm('/media/startos/volumes/main/start9', {
          recursive: true,
        }).catch(console.error)
      }

      // Preserve existing password from config, or generate a new one
      const existingConfig = await configJson.read().once()
      const dbPassword = existingConfig?.DATABASE?.PASSWORD || getDbPassword()

      await configJson.merge(effects, {
        DATABASE: { PASSWORD: dbPassword },
        ...custom,
      })
    },
    down: IMPOSSIBLE,
  },
})
