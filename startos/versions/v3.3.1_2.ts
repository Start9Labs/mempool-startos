import { IMPOSSIBLE, VersionInfo, YAML } from '@start9labs/start-sdk'
import { readFile, rm, writeFile } from 'fs/promises'
import { configJson } from '../file-models/mempool-config.json'

export const v_3_3_1_2 = VersionInfo.of({
  version: '3.3.1:2',
  releaseNotes: {
    en_US: 'Internal updates (start-sdk 1.3.3)',
    es_ES: 'Actualizaciones internas (start-sdk 1.3.3)',
    de_DE: 'Interne Aktualisierungen (start-sdk 1.3.3)',
    pl_PL: 'Aktualizacje wewnętrzne (start-sdk 1.3.3)',
    fr_FR: 'Mises à jour internes (start-sdk 1.3.3)',
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
