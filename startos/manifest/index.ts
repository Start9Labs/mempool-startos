import { setupManifest } from '@start9labs/start-sdk'
import {
  alertInstall,
  alertUpdate,
  bitcoindDescription,
  clnDescription,
  electrsDescription,
  fulcrumDescription,
  lndDescription,
  long,
  short,
} from './i18n'

export const manifest = setupManifest({
  id: 'mempool',
  title: 'Mempool',
  license: 'AGPL',
  packageRepo: 'https://github.com/Start9Labs/mempool-startos',
  upstreamRepo: 'https://github.com/mempool/mempool',
  marketingUrl: 'https://mempool.space',
  donationUrl: 'https://mempool.space/sponsor',
  docsUrls: ['https://mempool.space/docs/'],
  description: { short, long },
  volumes: ['main', 'cache', 'db', 'config'],
  images: {
    frontend: {
      source: {
        dockerTag: 'mempool/frontend:v3.3.1',
      },
      arch: ['x86_64', 'aarch64'],
    },
    backend: {
      source: {
        dockerTag: 'mempool/backend:v3.3.1',
      },
      arch: ['x86_64', 'aarch64'],
    },
    mariadb: {
      source: {
        dockerTag: 'mariadb:10.4.32',
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: alertInstall,
    update: alertUpdate,
  },
  dependencies: {
    bitcoind: {
      description: bitcoindDescription,
      optional: false,
      metadata: {
        title: 'Bitcoin',
        icon: 'https://raw.githubusercontent.com/Start9Labs/bitcoin-core-startos/refs/heads/30.x/dep-icon.svg',
      },
    },
    electrs: {
      description: electrsDescription,
      optional: true,
      metadata: {
        title: 'Electrs',
        icon: 'https://raw.githubusercontent.com/Start9Labs/electrs-startos/refs/heads/master/icon.svg',
      },
    },
    fulcrum: {
      description: fulcrumDescription,
      optional: true,
      metadata: {
        title: 'Fulcrum',
        icon: 'https://raw.githubusercontent.com/Start9Labs/fulcrum-startos/master/icon.png',
      },
    },
    'c-lightning': {
      description: clnDescription,
      optional: true,
      metadata: {
        title: 'Core Lightning',
        icon: 'https://raw.githubusercontent.com/Start9Labs/cln-startos/refs/heads/master/icon.svg',
      },
    },
    lnd: {
      description: lndDescription,
      optional: true,
      metadata: {
        title: 'LND',
        icon: 'https://raw.githubusercontent.com/Start9Labs/lnd-startos/refs/heads/master/icon.svg',
      },
    },
  },
})
