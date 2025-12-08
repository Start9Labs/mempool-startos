import { setupManifest } from '@start9labs/start-sdk'
import { SDKImageInputSpec } from '@start9labs/start-sdk/base/lib/types/ManifestTypes'

const BUILD = process.env.BUILD || ''

const arch =
  BUILD === 'x86_64' || BUILD === 'aarch64' ? [BUILD] : ['x86_64', 'aarch64']

export const manifest = setupManifest({
  id: 'mempool',
  title: 'Mempool',
  license: 'AGPL',
  wrapperRepo: 'https://github.com/Start9Labs/mempool-wrapper',
  upstreamRepo: 'https://github.com/mempool/mempool',
  supportSite: 'https://mempool.space/docs/faq',
  marketingSite: 'https://mempool.space',
  donationUrl: 'https://mempool.space/sponsor',
  docsUrl:
    'https://github.com/Start9Labs/mempool-startos/blob/update/040/docs/instructions.md',
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
      arch,
    } as SDKImageInputSpec,
    backend: {
      source: {
        dockerTag: 'mempool/backend:v3.2.1',
      },
      arch,
    } as SDKImageInputSpec,
    mariadb: {
      source: {
        dockerTag: 'mariadb:10.4.32',
      },
      arch,
    } as SDKImageInputSpec,
  },
  hardwareRequirements: {
    arch,
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
        title: 'A Bitcoin Full Node',
        icon: 'https://bitcoin.org/img/icons/opengraph.png',
      },
    },
    electrs: {
      description: 'Provides an index for address lookups',
      optional: true,
      s9pk: 'https://github.com/Start9Labs/electrs-startos/releases/download/v0.10.10.1-beta.0/electrs.s9pk',
    },
    'c-lightning': {
      description: 'Used to provide Lightning Network data',
      optional: true,
      s9pk: 'https://github.com/Start9Labs/cln-startos/releases/download/v25.09.1.2-beta.1/c-lightning.s9pk',
    },
    lnd: {
      description: 'Used to provide Lightning Network data',
      optional: true,
      s9pk: 'https://github.com/Start9Labs/lnd-startos/releases/download/v0.20.0-beta.1-beta.0/lnd.s9pk',
    },
  },
})
