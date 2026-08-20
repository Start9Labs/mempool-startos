import { T } from '@start9labs/start-sdk'
import { autoconfig } from 'bitcoin-core-startos/startos/actions/config/autoconfig'
import { configJson } from './file-models/mempool-config.json'
import { storeJson } from './file-models/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { selectedIndexer } from './utils'

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
    'bitcoind' | 'lnd' | 'c-lightning' | 'fulcrum' | 'electrs' | 'tor',
    T.DependencyRequirement
  >

  const lnData = await configJson.read((c) => c.LIGHTNING).const(effects)
  const indexer = await selectedIndexer(effects)
  const torProxy = await storeJson.read((s) => s?.torProxy).const(effects)

  if (lnData && lnData.ENABLED) {
    if (lnData.BACKEND === 'lnd') {
      currentDeps.lnd = {
        id: 'lnd',
        kind: 'running',
        versionRange: '>=0.21.1-beta:4',
        healthChecks: ['lnd', 'sync-progress'],
      }
    }

    if (lnData.BACKEND === 'cln') {
      currentDeps['c-lightning'] = {
        id: 'c-lightning',
        kind: 'running',
        versionRange: '>=26.6.6:1',
        healthChecks: ['lightningd', 'check-synced'],
      }
    }
  }

  if (torProxy) {
    currentDeps.tor = {
      id: 'tor',
      kind: 'running',
      versionRange: '>=0.4.9.11:4',
      healthChecks: ['tor'],
    }
  }

  if (indexer === 'fulcrum') {
    currentDeps.fulcrum = {
      id: 'fulcrum',
      kind: 'running',
      versionRange: '>=2.1.1:8',
      healthChecks: ['primary', 'sync-progress'],
    }
  } else if (indexer === 'electrs') {
    currentDeps.electrs = {
      id: 'electrs',
      kind: 'running',
      versionRange: '>=0.11.1:11',
      healthChecks: ['electrs', 'sync'],
    }
  }

  return {
    ...currentDeps,
    bitcoind: {
      kind: 'running',
      versionRange:
        '(>=28.4:17 && <29) || (>=29.4:4 && <30) || (>=30.3:4 && <31) || >=31.1:4',
      healthChecks: ['bitcoind', 'sync-progress'],
    },
  }
})
