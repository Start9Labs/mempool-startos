import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// StartOS-level state, kept out of the upstream mempool-config.json: the user's
// chosen Electrum indexer (the discriminator for which optional dependency backs
// address lookups) and whether external requests should go over Tor. Both are
// intent; the addresses they resolve to live in mempool-config.json's
// ELECTRUM.HOST and SOCKS5PROXY, written by init/watchHosts and
// init/watchTorProxy. Keeping intent here is what lets the proxy be switched off
// when tor is uninstalled without forgetting that the user asked for it.
const shape = z.object({
  // Absent means the choice is unmade; 'none' is the user declining an indexer.
  indexer: z.enum(['electrs', 'fulcrum', 'none']).optional().catch(undefined),
  torProxy: z.boolean().catch(false),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.startos, subpath: '/store.json' },
  shape,
)
