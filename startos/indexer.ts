import { T } from '@start9labs/start-sdk'
import { configJson } from './file-models/mempool-config.json'
import { sdk } from './sdk'
import { bridgeAddr } from './utils'

export type Indexer = 'electrs' | 'fulcrum'

// electrs and fulcrum are optional dependencies that Mempool does not depend on
// at the npm level, so their host/interface ids are string literals rather than
// imported constants. Both expose the Electrum interface `main`; electrs groups
// it under host `electrum`, fulcrum under host `main`.
const INDEXER_HOSTS: Record<Indexer, { packageId: string; hostId: string }> = {
  electrs: { packageId: 'electrs', hostId: 'electrum' },
  fulcrum: { packageId: 'fulcrum', hostId: 'main' },
}
const indexerInterfaceId = 'main'

/**
 * The user's selected Electrum indexer. Reads the dedicated ELECTRUM.INDEXER
 * field, falling back once to the legacy `<indexer>.startos` value that older
 * installs stored in ELECTRUM.HOST before the selector got its own field
 * (watchHosts persists INDEXER, so the fallback is a one-time bootstrap). The
 * legacy read is `.once()` so callers that also write ELECTRUM.HOST don't
 * subscribe to it.
 */
export async function selectedIndexer(
  effects: T.Effects,
): Promise<Indexer | undefined> {
  const indexer = await configJson
    .read((c) => c.ELECTRUM.INDEXER)
    .const(effects)
  if (indexer) return indexer
  const legacy = await configJson.read((c) => c.ELECTRUM.HOST).once()
  if (legacy === 'fulcrum.startos') return 'fulcrum'
  if (legacy === 'electrs.startos') return 'electrs'
  return undefined
}

/**
 * The selected indexer's plain (non-TLS) Electrum `host`/`port` over the bridge,
 * replacing `<indexer>.startos:50001`. `undefined` until the indexer's
 * interface is available.
 */
export const electrumBridge = (effects: T.Effects, indexer: Indexer) => {
  const { packageId, hostId } = INDEXER_HOSTS[indexer]
  return sdk.host
    .get(effects, { hostId, packageId }, (host) => {
      const h = bridgeAddr(host, indexerInterfaceId, false)
      return h && h.port != null ? { host: h.hostname, port: h.port } : undefined
    })
    .const()
}
