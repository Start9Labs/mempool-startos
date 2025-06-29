import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { readFile, rm } from 'fs/promises'
import { load } from 'js-yaml'
import { ConfigJson, configJson } from '../../file-models/mempool-config.json'
import { configJsonDefaults } from '../../utils'

export const v_3_2_1_1 = VersionInfo.of({
  version: '3.2.1:1',
  releaseNotes: 'Updated for StartOS 0.4.0',
  migrations: {
    up: async ({ effects }) => {
      // @TODO check configurations, move db files

      const custom = {} as any // Partial<ConfigJson>
      const config = load(
        await readFile(
          '/media/startos/volumes/main/start9/config.yaml',
          'utf-8',
        ),
      ) as {
        addressLookups: boolean
        lightning: string
      } // @TODO confirm

      switch (config.lightning) {
        case 'cln':
          custom.LIGHTNING.ENABLED = true
          custom.LIGHTNING.BACKEND = 'c-lightning' // @TODO confirm
          break
        case 'lnd':
          custom.LIGHTNING.ENABLED = true
          custom.LIGHTNING.BACKEND = 'lnd'
          break
        default:
          custom.LIGHTNING.ENABLED = false
      }

      if (config.addressLookups) {
        custom.MEMPOOL.BACKEND = 'electrum'
      }

      await configJson.write(effects, { ...configJsonDefaults, ...custom })

      // remove old start9 dir
      rm('/media/startos/volumes/main/start9', { recursive: true }).catch(
        console.error,
      )
    },
    down: IMPOSSIBLE,
  },
})
