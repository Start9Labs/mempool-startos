import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// StartOS-level state, kept out of the upstream mempool-config.json. Currently
// just the user's chosen Electrum indexer — the discriminator for which optional
// dependency backs address lookups. The resolved bridge address itself lives in
// mempool-config.json's ELECTRUM.HOST, written by init/watchHosts.
const shape = z.object({
  indexer: z.enum(['electrs', 'fulcrum']).optional().catch(undefined),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.startos, subpath: '/store.json' },
  shape,
)
