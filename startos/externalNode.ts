import { i18n } from './i18n'

/** The `CORE_RPC` fields the check needs; the password never leaves this process. */
export type ExternalRpc = {
  HOST?: string
  PORT: number
  USERNAME: string
  PASSWORD: string
}

type Health = {
  result: 'success' | 'failure' | 'loading'
  message: string
}

type RpcOutcome =
  | { ok: true; result: any }
  | { ok: false; status: number; error?: string }

async function call(rpc: ExternalRpc, method: string): Promise<RpcOutcome> {
  const auth = Buffer.from(`${rpc.USERNAME}:${rpc.PASSWORD}`).toString('base64')
  const res = await fetch(`http://${rpc.HOST}:${rpc.PORT}/`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({ jsonrpc: '1.0', id: 'startos', method, params: [] }),
    signal: AbortSignal.timeout(10_000),
  })
  if (res.status === 401 || res.status === 403)
    return { ok: false, status: res.status }
  type Body = { result?: any; error?: { message?: string } | null }
  let body: Body
  try {
    body = (await res.json()) as Body
  } catch {
    return { ok: false, status: res.status }
  }
  if (body.error)
    return { ok: false, status: res.status, error: body.error.message }
  if (!res.ok) return { ok: false, status: res.status }
  return { ok: true, result: body.result }
}

/**
 * Health of an external Bitcoin node, standing in for what the local
 * `bitcoind` dependency's `bitcoind` and `sync-progress` checks report:
 * reachable, credentials accepted, archival, transaction index present and
 * built, chain synced. Each failure names its cause, because with an external
 * node nothing else on this server can.
 */
export async function checkExternalNode(rpc: ExternalRpc): Promise<Health> {
  let chain: any
  try {
    const r = await call(rpc, 'getblockchaininfo')
    if (!r.ok) {
      if (r.status === 401 || r.status === 403) {
        return {
          result: 'failure',
          message: i18n('The node rejected the RPC username or password.'),
        }
      }
      return {
        result: 'failure',
        message: `${i18n('The node answered with an error')}: ${r.error ?? `HTTP ${r.status}`}`,
      }
    }
    chain = r.result
  } catch {
    return {
      result: 'failure',
      message: i18n(
        "Cannot reach the node. Check the host and port, and that the node's rpcbind and rpcallowip admit this server.",
      ),
    }
  }

  if (chain?.pruned) {
    return {
      result: 'failure',
      message: i18n(
        'The node is pruned. Mempool needs an archival node (prune=0).',
      ),
    }
  }
  if (
    chain?.initialblockdownload ||
    (chain?.verificationprogress ?? 1) < 0.9999
  ) {
    const pct = ((chain?.verificationprogress ?? 0) * 100).toFixed(2)
    return {
      result: 'loading',
      message: `${i18n('The node is still syncing')}: ${pct} % (${chain?.blocks} / ${chain?.headers})`,
    }
  }

  let index: any
  try {
    const r = await call(rpc, 'getindexinfo')
    if (!r.ok) {
      return {
        result: 'failure',
        message: `${i18n('The node answered with an error')}: ${r.error ?? `HTTP ${r.status}`}`,
      }
    }
    index = r.result
  } catch {
    return {
      result: 'failure',
      message: i18n(
        "Cannot reach the node. Check the host and port, and that the node's rpcbind and rpcallowip admit this server.",
      ),
    }
  }
  const txindex = index?.txindex
  if (!txindex) {
    return {
      result: 'failure',
      message: i18n(
        'The node has no transaction index. Enable txindex=1 and let it build.',
      ),
    }
  }
  if (!txindex.synced) {
    return {
      result: 'loading',
      message: `${i18n('The node is building its transaction index')}: ${txindex.best_block_height} / ${chain?.blocks}`,
    }
  }
  return {
    result: 'success',
    message: `${i18n('Connected to the node at height')} ${chain?.blocks}`,
  }
}
