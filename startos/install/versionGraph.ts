import { VersionGraph } from '@start9labs/start-sdk'
import { current, other } from './versions'
import { sdk } from '../sdk'
import { configJsonDefaults } from '../utils'
import { configJson } from '../file-models/mempool-config.json'

export const versionGraph = VersionGraph.of({
  current,
  other,
  preInstall: async (effects) => {
    console.log('Initializing mariadb...')
    await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'mariadb' },
      sdk.Mounts.of()
        .mountVolume({
          volumeId: 'mariadb',
          subpath: null,
          mountpoint: '/var/lib/mysql',
          readonly: false,
        })
        .mountAssets({
          subpath: null,
          mountpoint: '/assets',
          type: 'directory',
        }),
      'initalize-mariadb',
      async (sub) => {
        await sub.execFail(['sh', '/assets/scripts/init-db.sh'], {
          env: {
            MYSQL_DATABASE: configJsonDefaults.DATABASE.DATABASE,
            MYSQL_USER: configJsonDefaults.DATABASE.USERNAME,
            MYSQL_PASSWORD: configJsonDefaults.DATABASE.PASSWORD,
            MYSQL_ROOT_PASSWORD: 'admin',
          },
        })
      },
    )
    console.log('Mariadb initialization complete')

    // write config defaults
    await configJson.write(effects, configJsonDefaults)
  },
})
