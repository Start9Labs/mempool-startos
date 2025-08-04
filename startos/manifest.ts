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
  description: {
    short: 'A mempool and blockchain explorer and network visualizer.',
    long: 'Mempool is a fully featured visualizer, explorer, and API service that runs locally on your server, an open source project developed and operated for the benefit of the Bitcoin community, with a focus on the emerging transaction fee market to help our transition into a multi-layer ecosystem.',
  },
  volumes: ['frontend', 'backend', 'mariadb'],
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
  hardwareRequirements: {},
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
      description:
        'A Bitcoin node is needed to subscribe to new block events and provide data for your explorer',
      optional: false,
      s9pk: 'https://github.com/Start9Labs/bitcoind-startos/releases/download/v28.1.0.3-alpha.6/bitcoind.s9pk',
    },
    electrs: {
      description: 'Provides an index for address lookups',
      optional: true,
      s9pk: 'https://github.com/Start9Labs/electrs-startos/releases/download/v0.10.9-1-alpha.2/electrs.s9pk',
    },
    'c-lightning': {
      description: 'Used to provide Lightning Network data',
      optional: true,
      s9pk: 'https://github.com/Start9Labs/cln-startos/releases/download/v25.02.2/c-lightningV2.s9pk',
    },
    lnd: {
      description: 'Used to provide Lightning Network data',
      optional: true,
      s9pk: 'https://github.com/Start9Labs/lnd-startos/releases/download/v0.19.1-beta.1-alpha.4/lnd.s9pk',
    },
  },
})
