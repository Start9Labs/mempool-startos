import { VersionGraph } from '@start9labs/start-sdk'
import { current, other } from './versions'
import { sdk } from '../sdk'

export const versionGraph = VersionGraph.of({
  current,
  other,
  preInstall: async (effects) => {
    console.log('Initializing mariadb...')
    await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'mariadb' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'mariadb',
        subpath: null,
        mountpoint: '/var/lib/mysql',
        readonly: false,
      }),
      'initalize-mariadb',
      async (sub) => {
        await sub.exec(['chmod', '777', '/datadir'])
      },
    )
    console.log('Mariadb initialization complete')
  },
})
