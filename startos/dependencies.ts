import { sdk } from './sdk'
import { T } from '@start9labs/start-sdk'
import { config } from 'bitcoind-startos/startos/actions/config/config'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  await sdk.action.request(effects, 'bitcoind', config, 'important', {
    input: {
      kind: 'partial',
      value: {
        advanced: {
          prune: 0,
        },
        txindex: true,
        mempool: {
          maxmempool: 300, // TODO getSystemMemoryLimit - how with sdk / effects?
        },
      },
    },
    when: { condition: 'input-not-matches', once: false },
    reason:
      'Mempool requires an transaction indexing enabled and an unpruned bitcoin node.',
  })

  let currentDeps = {} as Record<
    'bitcoind' | 'lnd' | 'c-lightning' | 'electrs',
    T.DependencyRequirement
  >

  const ln = await sdk.store.getOwn(effects, sdk.StorePath.lightning).const()
  const electrsEnabled = await sdk.store
    .getOwn(effects, sdk.StorePath.electrs)
    .const()

  if (ln === 'lnd') {
    currentDeps.lnd = {
      id: 'lnd',
      kind: 'running',
      versionRange: '>=0.18.3',
      healthChecks: [],
    }
  }

  if (ln === 'cln') {
    currentDeps['c-lightning'] = {
      id: 'c-lightning',
      kind: 'running',
      versionRange: '>=24.08.1:1', // @TODO confirm
      healthChecks: [],
    }
  }

  if (electrsEnabled) {
    currentDeps.electrs = {
      id: 'electrs',
      kind: 'running',
      versionRange: '>=0.10.6:1', // @TODO confirm
      healthChecks: [],
    }
  }

  return {
    ...currentDeps,
    bitcoind: {
      kind: 'running',
      versionRange: '>=28.0.0:1', // @TODO confirm
      healthChecks: [],
    },
  }
})

// async function getSystemMemoryLimit(effects: T.Effects) {
//   try {
//     const memdata = await effects.readFile({ volumeId: 'main', path: 'start9/system_mem_info'})
//     // convert kb to mb
//     const memMB = parseInt(memdata) / 1000
//     return Math.round(memMB / 6)
//   } catch (_e) {
//     // recommended default is 300MB
//     return 300
//   }
// }
