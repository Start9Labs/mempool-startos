import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { readFile, rm } from 'fs/promises'
import { load } from 'js-yaml'
import { configJson } from '../../file-models/mempool-config.json'
import { configJsonDefaults } from '../../utils'

export const v_3_2_1_4 = VersionInfo.of({
  version: '3.2.1:4-beta.0',
  releaseNotes: 'Updated for StartOS 0.4.0',
  migrations: {
    up: async ({ effects }) => {
      const custom = {} as any
      try {
        const configYaml = await readFile(
          '/media/startos/volumes/main/start9/config.yaml',
          'utf-8',
        )
        const config = load(configYaml) as {
          'enable-electrs'?: boolean
          indexer?: {
            type: 'electrs' | 'fulcrum' | 'none'
          }
          lightning: {
            type: 'cln' | 'lnd' | 'none'
          }
        }
        if (config.lightning.type !== 'none') {
          custom.LIGHTNING.ENABLED = true
          custom.LIGHTNING.BACKEND = config.lightning.type
        } else {
          custom.LIGHTNING.ENABLED = false
        }

        if (config['enable-electrs']) {
          custom.MEMPOOL.BACKEND = 'electrum'
          custom.ELECTRUM = {
            HOST: 'electrs.startos',
            PORT: 50001,
            TLS_ENABLED: false,
          }
        } else if (config.indexer && config.indexer.type === 'electrs') {
          custom.MEMPOOL.BACKEND = 'electrum'
          custom.ELECTRUM = {
            HOST: 'electrs.startos',
            PORT: 50001,
            TLS_ENABLED: false,
          }
        } else if (config.indexer && config.indexer.type === 'fulcrum') {
          custom.MEMPOOL.BACKEND = 'electrum'
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
        // write config defaults
        await configJson.write(effects, { ...configJsonDefaults, ...custom })
      } catch (error) {
        console.log('No config.yaml found')
      }
    },
    down: IMPOSSIBLE,
  },
})
