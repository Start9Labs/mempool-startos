import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { readFile, rm } from 'fs/promises'
import { load } from 'js-yaml'
import { configJson } from '../../file-models/mempool-config.json'
import { configJsonDefaults } from '../../utils'

export const v_3_2_1_2 = VersionInfo.of({
  version: '3.2.1:2-alpha.0',
  releaseNotes: 'Updated for StartOS 0.4.0',
  migrations: {
    up: async ({ effects }) => {
      const custom = {} as any
      const configYaml = await readFile(
        '/media/startos/volumes/main/start9/config.yaml',
        'utf-8',
      ).catch(console.error)
      if (configYaml) {
        const config = load(configYaml) as {
          'enable-electrs': boolean
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
        }

        // remove old start9 dir
        rm('/media/startos/volumes/main/start9', {
          recursive: true,
        }).catch(console.error)
      }
      // write config defaults
      await configJson.write(effects, { ...configJsonDefaults, ...custom })
    },
    down: IMPOSSIBLE,
  },
})
