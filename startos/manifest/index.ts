import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'mempool',
  title: 'Mempool',
  license: 'AGPL',
  packageRepo: 'https://github.com/Start9Labs/mempool-startos',
  upstreamRepo: 'https://github.com/mempool/mempool',
  marketingUrl: 'https://mempool.space',
  donationUrl: 'https://mempool.space/sponsor',
  description: { short, long },
  volumes: ['main', 'cache', 'db', 'config', 'startos'],
  images: {
    frontend: {
      source: {
        dockerTag: 'mempool/frontend:v3.3.1',
      },
      arch: ['x86_64', 'aarch64'],
      emulateMissing: false,
    },
    backend: {
      source: {
        dockerTag: 'mempool/backend:v3.3.1',
      },
      arch: ['x86_64', 'aarch64'],
      emulateMissing: false,
    },
    mariadb: {
      source: {
        dockerTag: 'mariadb:10.4.34',
      },
      arch: ['x86_64', 'aarch64'],
      emulateMissing: false,
    },
  },
})
