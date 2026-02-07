import { setupManifest } from '@start9labs/start-sdk'

export const manifest = setupManifest({
  id: 'mempool',
  title: 'Mempool',
  license: 'AGPL',
  wrapperRepo: 'https://github.com/Start9Labs/mempool-wrapper',
  upstreamRepo: 'https://github.com/mempool/mempool',
  supportSite: 'https://mempool.space/docs/faq',
  marketingSite: 'https://mempool.space',
  donationUrl: 'https://mempool.space/sponsor',
  docsUrl: 'https://mempool.space/docs/',
  description: {
    short: 'A mempool and blockchain explorer and network visualizer.',
    long: 'Mempool is a fully featured visualizer, explorer, and API service that runs locally on your server, an open source project developed and operated for the benefit of the Bitcoin community, with a focus on the emerging transaction fee market to help our transition into a multi-layer ecosystem.',
  },
  volumes: ['main', 'cache', 'db', 'config'],
  images: {
    frontend: {
      source: {
        dockerTag: 'mempool/frontend:v3.2.1',
      },
    },
    backend: {
      source: {
        dockerTag: 'mempool/backend:v3.2.1',
      },
    },
    mariadb: {
      source: {
        dockerTag: 'mariadb:10.4.32',
      },
    },
  },
  alerts: {
    install:
      'When first running Mempool, previous block fee estimates will show as zero values until the service is able to catch up. Lookups may be slow or time out altogether while the service is still warming up, or if there are too many other things running on your system.',
    update:
      'Your mempool will need to reindex following an update, which can take up to an hour depending on your hardware.',
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {
    bitcoind: {
      description: 'Used to subscribe to new block events.',
      optional: false,
      metadata: {
        title: 'Bitcoin',
        icon: 'https://bitcoin.org/img/icons/opengraph.png',
      },
    },
    electrs: {
      description: 'Provides an index for address lookups',
      optional: true,
      metadata: {
        title: 'Electrs',
        icon: 'https://raw.githubusercontent.com/Start9Labs/electrs-startos/refs/heads/master/icon.png',
      },
    },
    fulcrum: {
      description: 'Provides an index for address lookups',
      optional: true,
      metadata: {
        title: 'Fulcrum',
        icon: 'https://raw.githubusercontent.com/Start9Labs/fulcrum-startos/master/icon.png',
      },
    },
    'c-lightning': {
      description: 'Used to provide Lightning Network data',
      optional: true,
      metadata: {
        title: 'Core Lightning',
        icon: 'https://raw.githubusercontent.com/Start9Labs/cln-startos/refs/heads/master/icon.png',
      },
    },
    lnd: {
      description: 'Used to provide Lightning Network data',
      optional: true,
      metadata: {
        title: 'LND',
        icon: 'https://raw.githubusercontent.com/Start9Labs/lnd-startos/update/040/icon.png',
      },
    },
  },
})
