import { setupManifest } from '@start9labs/start-sdk/lib/manifest/setupManifest'
import { actionsMetadata } from './procedures/actions'

/**
 * In this function you define static properties of the service
 */
export const manifest = setupManifest({
    id: 'mempool',
    title: 'Mempool',
    version: '2.5.0.2',
    releaseNotes: `* Refactor to new Start-SDK v0.4.0`,
    license: 'AGPL',
    replaces: Array<string>('Hosted block explorers'),
    wrapperRepo: 'https://github.com/Start9Labs/mempool-wrapper',
    upstreamRepo: 'https://github.com/mempool/mempool',
    supportSite: 'https://mempool.space/docs/faq',
    marketingSite: 'https://mempool.space',
    donationUrl: 'https://mempool.space/sponsor',
    description: {
        short: 'A mempool and blockchain explorer and network visualizer.',
        long: 'Mempool is a fully featured visualizer, explorer, and API service that runs locally on your server, an open source project developed and operated for the benefit of the Bitcoin community, with a focus on the emerging transaction fee market to help our transition into a multi-layer ecosystem.',
    },
    assets: {
        license: 'LICENSE',
        icon: 'assets/icon.png',
        instructions: 'assets/instructions.md',
    },
    volumes: {
        // This is the image where files from the project asset directory will go - this will either be assets
        main: 'data',
        mnt: 'assets',
    },
    containers: {
        main: {
            // Identifier for the main image volume, which will be used when other actions need to mount to this volume.
            image: 'main',
            // Specifies where to mount the data volume(s), if there are any. Mounts for pointer dependency volumes are also denoted here. These are necessary if data needs to be read from / written to these volumes.
            mounts: {
                // Specifies where on the service's file system its persistence directory should be mounted prior to service startup
                main: '/root',
                cache: '/backend/cache',
                db: '/var/lib/mysql',
                mnt: '/mnt'
            },
        },
    },
    actions: actionsMetadata,
    alerts: {
        install: null,
        update: 'WARNING: Your mempool will need to reindex following an update, which can take up to an hour depending on your hardware.',
        uninstall: null,
        restore: null,
        start: 'READ CAREFULLY! When first running Mempool, previous block fee estimates will show as zero values until the service is able to catch up. This is expected behaviour.  ALSO: Lookups may be slow or time out altogether while the service is still warming up, or if there are too many other things running on your system.If address lookups aren\'t working, try restarting electrs and try the lookup again.',
        stop: null,
    },
    /** See Hello Moon for an example with dependencies */
    dependencies: {
        'bitcoind': {
            version: '>=0.21.1.2 <26.0.0',
            description: 'A Bitcoin node is needed to subscribe to new block events and provide data for your explorer',
            // requirement: { type: 'required' },
            requirement: { type: 'opt-out', how: 'Alternatively select BTC Proxy or Bitcoin Core in config.' }
        },
        'btc-prc-proxy': {
            version: '>=0.3.2.5 <0.4.0',
            description: 'A Bitcoin node is needed to subscribe to new block events and provide data for your explorer',
            // requirement: { type: 'required' },
            requirement: { type: 'opt-in', how: 'Alternatively select BTC Proxy or Bitcoin Core in config.' }
        },
        'electrs': {
            version: '>=0.9.6 <0.10.0',
            description: 'Provides an index for address lookups',
            // requirement: { type: 'required' },
            requirement: { type: 'opt-out', how: 'Disable Electrs in config' }
        },
        'cln': {
            version: '>=0.10.1 <24.0.0',
            description: 'Used to provide Lightning Network data',
            // requirement: { type: 'required' },
            requirement: { type: 'opt-in', how: 'Can alternatively select LND in config.' }
        },
        'lnd': {
            version: '>=0.14.3 <0.17.0',
            description: 'Used to provide Lightning Network data',
            // requirement: { type: 'required' },
            requirement: { type: 'opt-in', how: 'Can alternatively select CLN in config.' }
        },
    },
})

export type Manifest = typeof manifest
