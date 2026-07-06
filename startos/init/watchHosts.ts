import { configJson } from '../file-models/mempool-config.json'
import { electrumBridge, selectedIndexer } from '../indexer'
import { sdk } from '../sdk'
import { bitcoindRpcBridge, lndRestBridge } from '../utils'

// A bridge address is always `<ipv4>:<port>`; split it into the HOST/PORT pair
// the CORE_RPC / ELECTRUM sections of mempool-config expect.
const hostPort = (addr: string) => {
  const i = addr.lastIndexOf(':')
  return { HOST: addr.slice(0, i), PORT: Number(addr.slice(i + 1)) }
}

/**
 * Resolves Mempool's dependency addresses over the LXC bridge and pins them into
 * mempool-config.json before the backend starts (`.startos` DNS is gone in
 * StartOS 2.0). Each address is a reactive `.const()` read whose mapped value
 * changes only when the address itself does, so this re-runs — and main
 * restarts the backend — exactly on a dependency's install / uninstall /
 * port-change (and on an indexer/backend selection change), never on a routine
 * dependency update. An absent dependency resolves to `null` and is omitted from
 * the config entirely (no fake placeholder address is written); the write heals
 * automatically when the dependency returns.
 */
export const watchHosts = sdk.setupOnInit(async (effects, _) => {
  const indexer = await selectedIndexer(effects)
  const lightning = await configJson.read((c) => c.LIGHTNING).const(effects)
  const lndEnabled = lightning?.ENABLED && lightning.BACKEND === 'lnd'

  // Always subscribe to bitcoind's reactive address; the indexer/LND reads stay
  // gated on selection. A `null` means the dependency is absent — omit its
  // section rather than write an unreachable address.
  const bitcoind = await bitcoindRpcBridge(effects)
  const electrum = indexer ? await electrumBridge(effects, indexer) : null
  const lndRest = lndEnabled ? await lndRestBridge(effects) : null

  await configJson.merge(
    effects,
    {
      ...(bitcoind && { CORE_RPC: hostPort(bitcoind) }),
      ...(electrum && {
        ELECTRUM: { ...hostPort(electrum), TLS_ENABLED: false },
      }),
      ...(lndRest && { LND: { REST_API_URL: `https://${lndRest}` } }),
    },
    { allowWriteAfterConst: true },
  )
})
