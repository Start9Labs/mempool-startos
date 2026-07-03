import { T, utils } from '@start9labs/start-sdk'
import {
  rpcHostId as btcRpcHostId,
  rpcInterfaceId as btcRpcInterfaceId,
} from 'bitcoin-core-startos/startos/utils'
import { controlHostId, lndconnectRestId } from 'lnd-startos/startos/interfaces'
import { sdk } from './sdk'

export const randomPassword = {
  charset: 'a-z,A-Z,1-9',
  len: 22,
}

export function getDbPassword(): string {
  return utils.getDefaultString(randomPassword)
}

export const uiPort = 8080
export const apiPort = 8999
export const dbPort = 3306
export const btcMountpoint = '/mnt/bitcoind'
export const lndMountpoint = '/mnt/lnd'
export const clnMountpoint = '/mnt/cln'

export const lndCertPath = `${lndMountpoint}/tls.cert`
export const lndMacaroonPath = `${lndMountpoint}/data/chain/bitcoin/mainnet/readonly.macaroon`

/**
 * The IPv4 LXC-bridge hostname/port for an interface on an already-resolved
 * host. Pure — call it INSIDE a `sdk.host` map fn so `.const()` narrows its
 * reactivity to just this address. `.startos` DNS / container IPs are
 * deprecated; containers reach each other over this bridge. `ssl` narrows to
 * the http vs https variant when a binding exposes both.
 */
export const bridgeAddr = (
  host: utils.FilledHost | null,
  interfaceId: string,
  ssl?: boolean,
) => {
  const iface =
    host &&
    Object.values(host.bindings)
      .flatMap((b) => Object.values(b.interfaces))
      .find((i) => i.id === interfaceId)
  return iface
    ? iface.addressInfo
        .filter({
          kind: 'bridge',
          predicate: (h) =>
            h.metadata.kind === 'ipv4' && (ssl === undefined || h.ssl === ssl),
        })
        .hostnames[0]
    : undefined
}

/**
 * bitcoind's RPC `host`/`port` over the bridge, replacing `bitcoind.startos:8332`
 * in mempool-config.json. `undefined` until bitcoind's interface is available.
 */
export const bitcoindRpcBridge = (effects: T.Effects) =>
  sdk.host
    .get(effects, { hostId: btcRpcHostId, packageId: 'bitcoind' }, (host) => {
      const h = bridgeAddr(host, btcRpcInterfaceId, false)
      return h && h.port != null ? { host: h.hostname, port: h.port } : undefined
    })
    .const()

/**
 * LND's REST base URL over the bridge (replaces `https://lnd.startos:8080`).
 * LND terminates its own TLS, so this reads the ssl bridge variant; Mempool
 * pins it against the mounted `tls.cert`. `undefined` until LND's interface is
 * available.
 */
export const lndRestBridge = (effects: T.Effects) =>
  sdk.host
    .get(effects, { hostId: controlHostId, packageId: 'lnd' }, (host) => {
      const h = bridgeAddr(host, lndconnectRestId, true)
      return h && `https://${h.hostname}:${h.port}`
    })
    .const()

// Performance profile presets. POLL_RATE_MS is the main-loop period;
// MEMPOOL_BLOCKS_AMOUNT is the depth of the Rust GBT projection. Both
// scale backend CPU roughly linearly. Single source of truth — referenced
// by the file model defaults, the migration, and the action.
export type PerformanceProfile = 'low-cpu' | 'balanced' | 'responsive'

export const PROFILES: Record<
  PerformanceProfile,
  { POLL_RATE_MS: number; MEMPOOL_BLOCKS_AMOUNT: number }
> = {
  'low-cpu': { POLL_RATE_MS: 8000, MEMPOOL_BLOCKS_AMOUNT: 4 },
  balanced: { POLL_RATE_MS: 4000, MEMPOOL_BLOCKS_AMOUNT: 6 },
  responsive: { POLL_RATE_MS: 2000, MEMPOOL_BLOCKS_AMOUNT: 8 },
}

export const DEFAULT_PROFILE: PerformanceProfile = 'low-cpu'
