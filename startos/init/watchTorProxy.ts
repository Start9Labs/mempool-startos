import { configJson } from '../file-models/mempool-config.json'
import { storeJson } from '../file-models/store.json'
import { sdk } from '../sdk'
import { hostPort, poolsUrls, torSocksBridge } from '../utils'

/**
 * Points mempool-config's `SOCKS5PROXY` at tor's SOCKS bridge when the user has
 * asked for it, and chooses where the backend fetches `pools-v2.json` from.
 *
 * The two are one decision. With the proxy on, upstream routes *every* external
 * request through it, including the pools fetch — and a SOCKS5 proxy cannot
 * reach the loopback address the bundled snapshot is served on — so the pools
 * URLs have to go back to GitHub, which the proxy can reach. With the proxy off
 * they point at the local snapshot and no name resolution is needed to boot.
 *
 * Tor being absent clears only the resolved address, so the `.const()` heals
 * into a working proxy when tor is installed later.
 */
export const watchTorProxy = sdk.setupOnInit(async (effects) => {
  const torProxy = await storeJson
    .read((s) => s?.torProxy ?? false)
    .const(effects)
  const socks = torProxy ? await torSocksBridge(effects) : null

  await configJson.merge(
    effects,
    {
      MEMPOOL: torProxy ? poolsUrls.github : poolsUrls.local,
      SOCKS5PROXY: socks
        ? { ENABLED: true, ...hostPort(socks) }
        : { ENABLED: false, HOST: undefined, PORT: undefined },
    },
    { allowWriteAfterConst: true },
  )
})
