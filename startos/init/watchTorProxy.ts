import { configJson } from '../file-models/mempool-config.json'
import { storeJson } from '../file-models/store.json'
import { sdk } from '../sdk'
import { hostPort, torSocksBridge } from '../utils'

/**
 * Points mempool-config's `SOCKS5PROXY` at tor's SOCKS bridge when the user has
 * asked for it. Tor being absent clears only the resolved address, so the
 * `.const()` heals into a working proxy when tor is installed later.
 */
export const watchTorProxy = sdk.setupOnInit(async (effects) => {
  const torProxy = await storeJson
    .read((s) => s?.torProxy ?? false)
    .const(effects)
  const socks = torProxy ? await torSocksBridge(effects) : null

  await configJson.merge(
    effects,
    {
      SOCKS5PROXY: socks
        ? { ENABLED: true, ...hostPort(socks) }
        : { ENABLED: false, HOST: undefined, PORT: undefined },
    },
    { allowWriteAfterConst: true },
  )
})
