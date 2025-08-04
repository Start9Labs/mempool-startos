import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { readFile, rm } from 'fs/promises'
import { load } from 'js-yaml'
import { configJson } from '../../file-models/mempool-config.json'
import { configJsonDefaults } from '../../utils'
import { sdk } from '../../sdk'

export const v_3_2_1_1 = VersionInfo.of({
  version: '3.2.1:1-alpha.0',
  releaseNotes: 'Updated for StartOS 0.4.0',
  migrations: {
    up: async ({ effects }) => {
      const custom = {} as any
      const oldConfigFile = await readFile(
        '/media/startos/volumes/main/start9/config.yaml',
        'utf-8',
      )
      if (oldConfigFile) {
        const config = load(oldConfigFile) as {
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
        rm('/media/startos/volumes/main/start9', { recursive: true }).catch(
          console.error,
        )
      }
      await configJson.write(effects, { ...configJsonDefaults, ...custom })

      // create needed group/user
      await sdk.SubContainer.withTemp(
        effects,
        { imageId: 'backend' },
        sdk.Mounts.of().mountVolume({
          volumeId: 'backend',
          subpath: null,
          mountpoint: '/backend',
          readonly: false,
        }),
        'create-user',
        async (sub) => {
          await sub.execFail(['groupadd', '-g', '1000', 'memgroup'], {
            user: 'root',
          })
          await sub.execFail(
            [
              'useradd',
              '-u',
              '1000',
              '-g',
              '1000',
              '-m',
              '-d',
              '/home/memuser',
              'memuser',
            ],
            { user: 'root' },
          )
        },
      )
      await sdk.SubContainer.withTemp(
        effects,
        { imageId: 'frontend' },
        sdk.Mounts.of().mountVolume({
          volumeId: 'frontend',
          subpath: null,
          mountpoint: '/root',
          readonly: false,
        }),
        'nginx-logs',
        async (sub) => {
          await sub.execFail(['chown', '-R', 'nginx:nginx', '/var/log/nginx'], {
            user: 'root',
          })
        },
      )
    },
    down: IMPOSSIBLE,
  },
})
