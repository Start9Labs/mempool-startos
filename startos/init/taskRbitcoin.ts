import { apis } from 'rbitcoin-startos/startos/actions/apis'
import { indexes } from 'rbitcoin-startos/startos/actions/indexes'
import { storage } from 'rbitcoin-startos/startos/actions/storage'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { selectedIndexer, selectedNode } from '../utils'

const apisTask = `rbitcoin:${apis.id}`
const indexesTask = `rbitcoin:${indexes.id}`
const storageTask = `rbitcoin:${storage.id}`

/**
 * What Mempool needs from rbitcoin depends on which choices point at it: RPC as
 * the node, Electrum and the address index as the indexer, full history for
 * either. Tasks that no longer apply are cleared here, so one left unanswered
 * cannot hold back a Mempool that stopped reading from rbitcoin.
 */
export const taskRbitcoin = sdk.setupOnInit(async (effects) => {
  const asNode = (await selectedNode(effects)) === 'rbitcoin'
  const asIndexer = (await selectedIndexer(effects)) === 'rbitcoin'

  if (!asNode && !asIndexer) {
    await sdk.action.clearTask(effects, apisTask, indexesTask, storageTask)
    return
  }

  const requiredApis = {
    ...(asNode && { rpc: { selection: 'enabled' as const } }),
    ...(asIndexer && { electrum_listen: true }),
  }
  await sdk.action.createTask(effects, 'rbitcoin', apis, 'critical', {
    input: { kind: 'partial', accept: [requiredApis], set: requiredApis },
    when: { condition: 'input-not-matches', once: false },
    reason: i18n('Enable the rbitcoin APIs Mempool reads from'),
  })

  const archival = { pruning: { selection: 'disabled' as const } }
  await sdk.action.createTask(effects, 'rbitcoin', storage, 'critical', {
    input: { kind: 'partial', accept: [archival], set: archival },
    when: { condition: 'input-not-matches', once: false },
    reason: i18n('Mempool needs rbitcoin to keep the full chain history'),
  })

  if (asIndexer) {
    const addressIndex = { sh_index: true }
    await sdk.action.createTask(effects, 'rbitcoin', indexes, 'critical', {
      input: { kind: 'partial', accept: [addressIndex], set: addressIndex },
      when: { condition: 'input-not-matches', once: false },
      reason: i18n('Enable the rbitcoin address index for Mempool lookups'),
    })
  } else {
    await sdk.action.clearTask(effects, indexesTask)
  }
})
