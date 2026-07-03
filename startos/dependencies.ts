import { T } from '@start9labs/start-sdk'
import { autoconfig } from 'bitcoin-core-startos/startos/actions/config/autoconfig'
import { configJson } from './file-models/mempool-config.json'
import { selectedIndexer } from './indexer'
import { i18n } from './i18n'
import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  await sdk.action.createTask(effects, 'bitcoind', autoconfig, 'critical', {
    input: {
      kind: 'partial',
      accept: [{ prune: 0, txindex: true }],
      set: { prune: 0, txindex: true },
    },
    when: { condition: 'input-not-matches', once: false },
    reason: i18n('Mempool requires an archival node and transaction indexing'),
  })

  let currentDeps = {} as Record<
    'bitcoind' | 'lnd' | 'c-lightning' | 'fulcrum' | 'electrs',
    T.DependencyRequirement
  >

  const lnData = await configJson.read((c) => c.LIGHTNING).const(effects)
  const indexer = await selectedIndexer(effects)

  if (lnData && lnData.ENABLED) {
    if (lnData.BACKEND === 'lnd') {
      currentDeps.lnd = {
        id: 'lnd',
        kind: 'running',
        versionRange: '>=0.21.1-beta:0',
        healthChecks: ['lnd', 'sync-progress'],
      }
    }

    if (lnData.BACKEND === 'cln') {
      currentDeps['c-lightning'] = {
        id: 'c-lightning',
        kind: 'running',
        versionRange: '>=26.6.1:2',
        healthChecks: ['lightningd', 'check-synced'],
      }
    }
  }

  if (indexer === 'fulcrum') {
    currentDeps.fulcrum = {
      id: 'fulcrum',
      kind: 'running',
      versionRange: '>=2.1.1:6',
      healthChecks: ['primary', 'sync-progress'],
    }
  } else if (indexer === 'electrs') {
    currentDeps.electrs = {
      id: 'electrs',
      kind: 'running',
      versionRange: '>=0.11.1:9',
      healthChecks: ['electrs', 'sync'],
    }
  }

  return {
    ...currentDeps,
    bitcoind: {
      kind: 'running',
      versionRange: '>=28.4:13',
      healthChecks: ['bitcoind', 'sync-progress'],
    },
  }
})
