import { T } from '@start9labs/start-sdk'
import { autoconfig } from 'bitcoin-core-startos/startos/actions/config/autoconfig'
import { configJson } from './fileModels/mempool-config.json'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import {
  bitcoindDescription,
  clnDescription,
  electrsDescription,
  fulcrumDescription,
  lndDescription,
  torDescription,
} from './manifest/i18n'
import { sdk } from './sdk'
import { selectedIndexer } from './utils'

const lightningBackend = async (effects: T.Effects) => {
  const lightning = await configJson.read((c) => c.LIGHTNING).const(effects)
  return lightning?.ENABLED ? lightning.BACKEND : null
}

const bitcoind = sdk.Dependency.required('bitcoind', {
  description: bitcoindDescription,
  metadata: {
    title: 'Bitcoin',
    icon: 'https://raw.githubusercontent.com/Start9Labs/bitcoin-core-startos/refs/heads/30.x/dep-icon.svg',
  },
  versionRange:
    '(>=28.4:29 && <29) || (>=29.4:16 && <30) || (>=30.3:16 && <31) || >=31.1:16 || >=#knotsprerdts:29.3:29',
  kind: 'running',
  healthChecks: ['bitcoind', 'sync-progress'],
}).withInit(async (effects) => {
  await sdk.action.createTask(effects, 'bitcoind', autoconfig, 'critical', {
    input: {
      kind: 'partial',
      accept: [{ prune: 0, txindex: true }],
      set: { prune: 0, txindex: true },
    },
    when: { condition: 'input-not-matches', once: false },
    reason: i18n('Mempool requires an archival node and transaction indexing'),
  })
})

const electrs = sdk.Dependency.optional('electrs', {
  description: electrsDescription,
  metadata: {
    title: 'Electrs',
    icon: 'https://raw.githubusercontent.com/Start9Labs/electrs-startos/refs/heads/master/icon.svg',
  },
  versionRange: '>=0.11.1:11',
  kind: 'running',
  healthChecks: ['electrs', 'sync'],
  enabled: async ({ effects }) =>
    (await selectedIndexer(effects)) === 'electrs',
})

const fulcrum = sdk.Dependency.optional('fulcrum', {
  description: fulcrumDescription,
  metadata: {
    title: 'Fulcrum',
    icon: 'https://raw.githubusercontent.com/Start9Labs/fulcrum-startos/master/icon.png',
  },
  versionRange: '>=2.1.1:8',
  kind: 'running',
  healthChecks: ['primary', 'sync-progress'],
  enabled: async ({ effects }) =>
    (await selectedIndexer(effects)) === 'fulcrum',
})

const cln = sdk.Dependency.optional('c-lightning', {
  description: clnDescription,
  metadata: {
    title: 'Core Lightning',
    icon: 'https://raw.githubusercontent.com/Start9Labs/cln-startos/refs/heads/master/icon.svg',
  },
  versionRange: '>=26.6.6:1',
  kind: 'running',
  healthChecks: ['lightningd', 'check-synced'],
  enabled: async ({ effects }) => (await lightningBackend(effects)) === 'cln',
})

const lnd = sdk.Dependency.optional('lnd', {
  description: lndDescription,
  metadata: {
    title: 'LND',
    icon: 'https://raw.githubusercontent.com/Start9Labs/lnd-startos/refs/heads/master/icon.svg',
  },
  versionRange: '>=0.21.1-beta:4',
  kind: 'running',
  healthChecks: ['lnd', 'sync-progress'],
  enabled: async ({ effects }) => (await lightningBackend(effects)) === 'lnd',
})

const tor = sdk.Dependency.optional('tor', {
  description: torDescription,
  metadata: {
    title: 'Tor',
    icon: 'https://raw.githubusercontent.com/Start9Labs/tor-startos/65faea17febc739d910e8c26ff4e61f6333487a8/icon.svg',
  },
  versionRange: '>=0.4.9.11:4',
  kind: 'running',
  healthChecks: ['tor'],
  enabled: async ({ effects }) =>
    !!(await storeJson.read((s) => s.torProxy).const(effects)),
})

export const dependencies = sdk.Dependencies.of()
  .addDependency(bitcoind)
  .addDependency(electrs)
  .addDependency(fulcrum)
  .addDependency(cln)
  .addDependency(lnd)
  .addDependency(tor)
