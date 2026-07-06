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
 * dependency update. An absent dependency resolves to a loopback placeholder
 * (rather than latching a recycled address) and heals automatically when the
 * dependency returns.
 */
export const watchHosts = sdk.setupOnInit(async (effects, _) => {
  const indexer = await selectedIndexer(effects)
  const lightning = await configJson.read((c) => c.LIGHTNING).const(effects)
  const lndEnabled = lightning?.ENABLED && lightning.BACKEND === 'lnd'

  await configJson.merge(
    effects,
    {
      CORE_RPC: hostPort(await bitcoindRpcBridge(effects)),
      ...(indexer && {
        ELECTRUM: {
          INDEXER: indexer,
          ...hostPort(await electrumBridge(effects, indexer)),
          TLS_ENABLED: false,
        },
      }),
      ...(lndEnabled && {
        LND: { REST_API_URL: `https://${await lndRestBridge(effects)}` },
      }),
    },
    { allowWriteAfterConst: true },
  )
})
