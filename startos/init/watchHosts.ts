import { configJson } from '../file-models/mempool-config.json'
import { sdk } from '../sdk'
import {
  bitcoindRpcBridge,
  electrumBridge,
  hostPort,
  lndRestBridge,
  selectedIndexer,
} from '../utils'

/**
 * Resolves Mempool's dependency addresses over the LXC bridge and pins them into
 * mempool-config.json before the backend starts (`.startos` DNS is gone in
 * StartOS 2.0). Each address is a reactive `.const()` read that
 * changes only when the address itself does, so this re-runs — and main
 * restarts the backend — exactly on a dependency's install / uninstall /
 * port-change (and on an indexer/backend selection change), never on a routine
 * dependency update. An absent dependency resolves to `null` and is omitted from
 * the config entirely (no fake placeholder address is written); the write heals
 * automatically when the dependency returns. `MEMPOOL.BACKEND` follows whether an
 * Electrum address resolved, so the backend is never left pointed at upstream's
 * own `ELECTRUM` defaults.
 */
export const watchHosts = sdk.setupOnInit(async (effects, _) => {
  const indexer = await selectedIndexer(effects)
  const lightning = await configJson.read((c) => c.LIGHTNING).const(effects)
  const lndEnabled = lightning?.ENABLED && lightning.BACKEND === 'lnd'

  // Always subscribe to bitcoind's reactive address; the indexer/LND reads stay
  // gated on selection. A `null` means the dependency is absent — omit its
  // section rather than write an unreachable address.
  const bitcoind = await bitcoindRpcBridge(effects)
  const electrum =
    indexer && indexer !== 'none'
      ? await electrumBridge(effects, indexer)
      : null
  const lndRest = lndEnabled ? await lndRestBridge(effects) : null

  await configJson.merge(
    effects,
    {
      ...(bitcoind && { CORE_RPC: hostPort(bitcoind) }),
      MEMPOOL: { BACKEND: electrum ? 'electrum' : 'none' },
      ...(electrum && {
        ELECTRUM: { ...hostPort(electrum), TLS_ENABLED: false },
      }),
      ...(lndRest && { LND: { REST_API_URL: `https://${lndRest}` } }),
    },
    { allowWriteAfterConst: true },
  )
})
