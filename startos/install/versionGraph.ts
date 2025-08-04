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
        await sub.exec(['chmod', '777', '/datadir'])
        await sub.execFail(['sh', '/assets/scripts/init-db.sh'], {
          env: {
            MYSQL_DATABASE: configJsonDefaults.DATABASE.DATABASE,
            MYSQL_USER: configJsonDefaults.DATABASE.USERNAME,
            MYSQL_PASSWORD: configJsonDefaults.DATABASE.PASSWORD,
          },
        })
      },
    )
    console.log('Mariadb initialization complete')

    // write config defaults
    await configJson.write(effects, configJsonDefaults)

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
})
