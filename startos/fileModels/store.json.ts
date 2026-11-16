import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// StartOS-level state, kept out of the upstream mempool-config.json: which
// Bitcoin node Mempool reads from (the discriminator for whether bitcoind is a
// dependency), the user's chosen Electrum indexer (the discriminator for which
// optional dependency backs address lookups) and whether external requests
// should go over Tor. All three are intent; the addresses they resolve to live
// in mempool-config.json's CORE_RPC, ELECTRUM.HOST and SOCKS5PROXY, written by
// init/watchHosts and init/watchTorProxy (or, for an external node or Electrum
// server, by the action that collected them). Keeping intent here is what lets
// the proxy be switched off when tor is uninstalled without forgetting that the
// user asked for it, and what stops a reappearing bitcoind from reclaiming a
// Mempool that was pointed elsewhere.
const shape = z.looseObject({
  // Absent means the Bitcoin service on this server, as every install before
  // the choice existed; 'external' is a node reached over RPC with credentials.
  node: z.enum(['bitcoind', 'external']).optional().catch(undefined),
  // Absent means the choice is unmade; 'none' is the user declining an indexer;
  // 'external' is an Electrum server reached over the network.
  indexer: z
    .enum(['electrs', 'fulcrum', 'none', 'external'])
    .optional()
    .catch(undefined),
  torProxy: z.boolean().catch(false),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.startos, subpath: '/store.json' },
  shape,
)
