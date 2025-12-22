import { VersionInfo, IMPOSSIBLE, YAML } from '@start9labs/start-sdk'
import { readFile, rm } from 'fs/promises'
import { configJson } from '../../file-models/mempool-config.json'
import { configJsonDefaults } from '../../utils'

export const v_3_2_1_4 = VersionInfo.of({
  version: '3.2.1:4-beta.0',
  releaseNotes: 'Updated for StartOS 0.4.0',
  migrations: {
    up: async ({ effects }) => {
      const custom = {} as any
      // get old config.yaml
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

        if (lightning.type !== 'none') {
          custom.LIGHTNING.ENABLED = true
          custom.LIGHTNING.BACKEND = lightning.type
        } else {
          custom.LIGHTNING.ENABLED = false
        }

        if (configYaml['enable-electrs']) {
          custom.MEMPOOL.BACKEND = 'electrum'
          custom.ELECTRUM = {
            HOST: 'electrs.startos',
            PORT: 50001,
            TLS_ENABLED: false,
          }
        } else if (indexer && indexer.type === 'electrs') {
          custom.MEMPOOL.BACKEND = 'electrum'
          custom.ELECTRUM = {
            HOST: 'electrs.startos',
            PORT: 50001,
            TLS_ENABLED: false,
          }
        } else if (indexer && indexer.type === 'fulcrum') {
          custom.MEMPOOL.BACKEND = 'electrum'
          custom.ELECTRUM = {
            HOST: 'fulcrum.startos',
            PORT: 50001,
            TLS_ENABLED: false,
          }
        }

        // write config defaults
        await configJson.write(effects, { ...configJsonDefaults, ...custom })

        // remove old start9 dir
        rm('/media/startos/volumes/main/start9', {
          recursive: true,
        }).catch(console.error)
      }
    },
    down: IMPOSSIBLE,
  },
})
