import { sdk } from './sdk'
import { T } from '@start9labs/start-sdk'
import { config } from 'bitcoind-startos/startos/actions/config/other'
import { configJson } from './file-models/mempool-config.json'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  // await sdk.action.createTask(effects, 'bitcoind', config, 'critical', {
  //   input: {
  //     kind: 'partial',
  //     value: {
  //       prune: 0,
  //       txindex: true,
  //       // mempool: {
  //       //   maxmempool: 300, // TODO getSystemMemoryLimit
  //       // },
  //     },
  //   },
  //   when: { condition: 'input-not-matches', once: false },
  //   reason:
  //     'Mempool requires transaction indexing enabled and an unpruned bitcoin node.',
  // })

  let currentDeps = {} as Record<
    'bitcoind' | 'lnd' | 'c-lightning' | 'electrs',
    T.DependencyRequirement
  >

  const lnData = await configJson.read((c) => c.LIGHTNING).const(effects)
  const electrsData = await configJson
    .read((c) => c.MEMPOOL.BACKEND)
    .const(effects)

  if (lnData && lnData.ENABLED) {
    if (lnData.BACKEND === 'lnd') {
      currentDeps.lnd = {
        id: 'lnd',
        kind: 'running',
        versionRange: '>=0.19.1-beta:1-alpha.4',
        healthChecks: [],
      }
    }

    if (lnData.BACKEND === 'cln') {
      currentDeps['c-lightning'] = {
        id: 'c-lightning',
        kind: 'running',
        versionRange: '>=25.02.2',
        healthChecks: [],
      }
    }
  }

  if (electrsData === 'electrum') {
    currentDeps.electrs = {
      id: 'electrs',
      kind: 'running',
      versionRange: '>=0.10.9:1-alpha.2',
      healthChecks: [],
    }
  }

  return {
    ...currentDeps,
    bitcoind: {
      kind: 'running',
      versionRange: '>=28.1:3-alpha.6',
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
