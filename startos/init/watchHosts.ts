import { configJson } from '../file-models/mempool-config.json'
import { electrumBridge, selectedIndexer } from '../indexer'
import { sdk } from '../sdk'
import { bitcoindRpcBridge, lndRestBridge } from '../utils'

/**
 * Resolves the addresses of Mempool's dependencies over the LXC bridge and pins
 * them into mempool-config.json before the backend starts. `.startos` DNS no
 * longer resolves in StartOS 2.0, so bitcoind's RPC, the selected Electrum
 * indexer, and (when LND is the Lightning backend) LND's REST endpoint are
 * looked up on the bridge each init and written into the config the backend
 * reads. The `sdk.host` reads are reactive, so this re-runs — and main restarts
 * the backend — whenever a resolved address changes. It never reads the fields
 * it writes (the indexer selector is read via ELECTRUM.INDEXER, not the HOST it
 * fills), so its own writes don't retrigger it.
 */
export const watchHosts = sdk.setupOnInit(async (effects, _) => {
  const bitcoind = await bitcoindRpcBridge(effects)

  const indexer = await selectedIndexer(effects)
  const electrum = indexer
    ? await electrumBridge(effects, indexer)
    : undefined

  const lightning = await configJson.read((c) => c.LIGHTNING).const(effects)
  const lndRest =
    lightning?.ENABLED && lightning.BACKEND === 'lnd'
      ? await lndRestBridge(effects)
      : undefined

  // Persist INDEXER whenever one is selected (bootstrapping legacy installs),
  // and fill HOST/PORT once its address resolves.
  const electrumPatch = indexer
    ? electrum
      ? {
          INDEXER: indexer,
          HOST: electrum.host,
          PORT: electrum.port,
          TLS_ENABLED: false,
        }
      : { INDEXER: indexer }
    : undefined

  await configJson.merge(
    effects,
    {
      ...(bitcoind && {
        CORE_RPC: { HOST: bitcoind.host, PORT: bitcoind.port },
      }),
      ...(electrumPatch && { ELECTRUM: electrumPatch }),
      ...(lndRest && { LND: { REST_API_URL: lndRest } }),
    },
    { allowWriteAfterConst: true },
  )
})
