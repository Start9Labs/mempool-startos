import { sdk } from '../../sdk'
import { manifest as helloWorldManifest } from 'hello-world-wrapper/startos/manifest'

export const dependencyMounts = sdk
  .setupDependencyMounts()
  .addPath({
    name: 'dataDir',
    manifest: helloWorldManifest,
    volume: 'main',
    path: '/data',
    readonly: true,
  })
  .build()
