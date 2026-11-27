import { configJson } from '../fileModels/mempool-config.json'
import { sdk } from '../sdk'
import {
  electrumBridge,
  hostPort,
  lndRestBridge,
  localNodeRpcBridge,
  selectedIndexer,
  selectedNode,
} from '../utils'

/**
 * Resolves Mempool's dependency addresses over the LXC bridge and pins them into
 * mempool-config.json before the backend starts (`.startos` DNS is gone in
 * StartOS 2.0). Each address is a reactive `.const()` read that
 * changes only when the address itself does, so this re-runs — and main
 * restarts the backend — exactly on a dependency's install / uninstall /
 * port-change (and on a node / indexer / backend selection change), never on a
 * routine dependency update. An absent dependency resolves to `null` and is
 * omitted from the config entirely (no fake placeholder address is written); the
 * write heals automatically when the dependency returns. `MEMPOOL.BACKEND`
 * follows whether an Electrum address is in place, so the backend is never left
 * pointed at upstream's own `ELECTRUM` defaults.
 *
 * An external Bitcoin node or Electrum server is not a dependency: its address
 * was written by the action that collected it, and is left untouched here —
 * including not subscribing to bitcoind's bridge address at all, so a Bitcoin
 * service installed on this server for some other purpose cannot restart or
 * reclaim a Mempool that reads elsewhere.
 */
export const watchHosts = sdk.setupOnInit(async (effects, _) => {
  const node = await selectedNode(effects)
  const indexer = await selectedIndexer(effects)
  const lightning = await configJson.read((c) => c.LIGHTNING).const(effects)
  const lndEnabled = lightning?.ENABLED && lightning.BACKEND === 'lnd'

  // Subscribe only to the local node in use, never to one Mempool does not read
  // from; the indexer/LND reads stay gated on selection. A `null` means the
  // dependency is absent — omit its section rather than write an unreachable
  // address.
  const localNode =
    node === 'external' ? null : await localNodeRpcBridge(effects, node)
  const electrum =
    indexer && indexer !== 'none' && indexer !== 'external'
      ? await electrumBridge(effects, indexer)
      : null
  const electrumInPlace = !!electrum || indexer === 'external'
  const lndRest = lndEnabled ? await lndRestBridge(effects) : null

  await configJson.merge(
    effects,
    {
      ...(localNode && { CORE_RPC: hostPort(localNode) }),
      MEMPOOL: { BACKEND: electrumInPlace ? 'electrum' : 'none' },
      ...(electrum && {
        ELECTRUM: { ...hostPort(electrum), TLS_ENABLED: false },
      }),
      ...(lndRest && { LND: { REST_API_URL: `https://${lndRest}` } }),
    },
    { allowWriteAfterConst: true },
  )
})
