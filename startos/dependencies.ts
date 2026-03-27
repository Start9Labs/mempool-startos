import { T } from '@start9labs/start-sdk'
import { autoconfig } from 'bitcoind-startos/startos/actions/config/autoconfig'
import { configJson } from './file-models/mempool-config.json'
import { i18n } from './i18n'
import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  await sdk.action.createTask(effects, 'bitcoind', autoconfig, 'critical', {
    input: {
      kind: 'partial',
      value: {
        prune: null,
        txindex: true,
      },
    },
    when: { condition: 'input-not-matches', once: false },
    reason: i18n('Mempool requires an archival node and transaction indexing'),
  })

  let currentDeps = {} as Record<
    'bitcoind' | 'lnd' | 'c-lightning' | 'fulcrum' | 'electrs',
    T.DependencyRequirement
  >

  const lnData = await configJson.read((c) => c.LIGHTNING).const(effects)
  const electrumHost = await configJson
    .read((c) => c.ELECTRUM.HOST)
    .const(effects)

  if (lnData && lnData.ENABLED) {
    if (lnData.BACKEND === 'lnd') {
      currentDeps.lnd = {
        id: 'lnd',
        kind: 'running',
        versionRange: '>=0.20.1-beta:1-beta.3',
        healthChecks: ['lnd'],
      }
    }

    if (lnData.BACKEND === 'cln') {
      currentDeps['c-lightning'] = {
        id: 'c-lightning',
        kind: 'running',
        versionRange: '>=25.12.1:4-beta.5',
        healthChecks: [],
      }
    }
  }

  if (electrumHost === 'fulcrum.startos') {
    currentDeps.fulcrum = {
      id: 'fulcrum',
      kind: 'running',
      versionRange: '>=2.1.0:7-beta.4',
      healthChecks: [],
    }
  } else if (electrumHost === 'electrs.startos') {
    currentDeps.electrs = {
      id: 'electrs',
      kind: 'running',
      versionRange: '>=0.11.1:1-beta.4',
      healthChecks: [],
    }
  }

  return {
    ...currentDeps,
    bitcoind: {
      kind: 'running',
      versionRange: '>=28.3:5-beta.4',
      healthChecks: ['bitcoind'],
    },
  }
})
