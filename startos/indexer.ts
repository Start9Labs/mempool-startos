import { T } from '@start9labs/start-sdk'
import { configJson } from './file-models/mempool-config.json'
import { bridgeAddress } from './utils'

export type Indexer = 'electrs' | 'fulcrum'

// electrs and fulcrum are optional dependencies Mempool does not depend on at
// the npm level, so their host ids are string literals rather than imported
// constants. Both bind the plaintext Electrum port 50001; electrs groups it
// under host `electrum`, fulcrum under host `main`.
const INDEXER_HOSTS: Record<Indexer, { packageId: string; hostId: string }> = {
  electrs: { packageId: 'electrs', hostId: 'electrum' },
  fulcrum: { packageId: 'fulcrum', hostId: 'main' },
}
const electrumPort = 50001

/**
 * The user's selected Electrum indexer, read from the dedicated ELECTRUM.INDEXER
 * discriminator. Installs from before that field existed are bootstrapped from
 * the legacy `<indexer>.startos` value by the 3.3.1:15 migration, so no runtime
 * fallback is needed here.
 */
export async function selectedIndexer(
  effects: T.Effects,
): Promise<Indexer | undefined> {
  return (
    (await configJson.read((c) => c.ELECTRUM.INDEXER).const(effects)) ??
    undefined
  )
}

/**
 * The selected indexer's plaintext (non-TLS) Electrum bridge address
 * (`<osIp>:50001`), replacing `<indexer>.startos:50001`. `null` while the
 * indexer is absent — the caller then omits `ELECTRUM.HOST`/`PORT` rather than
 * writing a fake address; the `.const()` heals when it reappears.
 */
export const electrumBridge = (effects: T.Effects, indexer: Indexer) => {
  const { packageId, hostId } = INDEXER_HOSTS[indexer]
  return bridgeAddress(effects, {
    packageId,
    hostId,
    internalPort: electrumPort,
  }).const()
}
