import { IMPOSSIBLE, VersionInfo, YAML } from '@start9labs/start-sdk'
import { readFile, rm, writeFile } from 'fs/promises'
import { configJson } from '../file-models/mempool-config.json'

export const v_3_2_1_9 = VersionInfo.of({
  version: '3.2.1:9',
  releaseNotes: {
    en_US:
      'Fixed MariaDB healthcheck authentication failure when upgrading from 0.3.5.1.',
    es_ES:
      'Se corrigio el fallo de autenticacion del chequeo de salud de MariaDB al actualizar desde 0.3.5.1.',
    de_DE:
      'Authentifizierungsfehler bei der MariaDB-Gesundheitspruefung beim Upgrade von 0.3.5.1 behoben.',
    pl_PL:
      'Naprawiono blad uwierzytelniania sprawdzania stanu MariaDB podczas aktualizacji z 0.3.5.1.',
    fr_FR:
      'Correction de l\'echec d\'authentification du bilan de sante MariaDB lors de la mise a jour depuis 0.3.5.1.',
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
      } else {
        await configJson.merge(effects, {})
      }
    },
    down: IMPOSSIBLE,
  },
})
