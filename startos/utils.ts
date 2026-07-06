import { T, utils } from '@start9labs/start-sdk'
import { rpcHostId, rpcPort } from 'bitcoin-core-startos/startos/utils'
import { controlHostId, restPort } from 'lnd-startos/startos/interfaces'
import { sdk } from './sdk'

export const randomPassword = {
  charset: 'a-z,A-Z,1-9',
  len: 22,
}

export function getDbPassword(): string {
  return utils.getDefaultString(randomPassword)
}

export const uiPort = 8080
// Host id of the Web UI binding (see interfaces.ts). Exported so dependents
// (am-i-exposed / canary) can resolve Mempool's UI over the bridge.
export const mainHostId = 'main'
export const apiPort = 8999
export const dbPort = 3306
export const btcMountpoint = '/mnt/bitcoind'
export const lndMountpoint = '/mnt/lnd'
export const clnMountpoint = '/mnt/cln'

export const lndCertPath = `${lndMountpoint}/tls.cert`
export const lndMacaroonPath = `${lndMountpoint}/data/chain/bitcoin/mainnet/readonly.macaroon`

/**
 * Bridge address (`<osIp>:<assigned external port>`) of a dependency's binding,
 * as a minimal reactive value. Chain `.const()` in init/main: the mapped string
 * only changes when the address itself does (deep-equal), so the calling
 * context re-runs exactly on a dependency's install / uninstall / port-change
 * and never on a routine dependency update. Chain `.once()` in an action
 * context. `fallbackPort` keeps the value non-null while the dependency is
 * absent — sanctioned only for an allocator-guaranteed port such as tor's SOCKS
 * 9050 (Mempool has none, so its callers get `null` while the dependency is
 * absent and omit the config field rather than write a fake address). Reads
 * `net.assignedPort`, never an addressInfo hostname, so a disabled binding
 * (e.g. LND locked) doesn't flap the value. Drop-in for the planned SDK
 * `sdk.host.getBridgeAddress`.
 */
export function bridgeAddress(
  effects: T.Effects,
  opts: {
    packageId: string
    hostId: string
    internalPort: number
    fallbackPort: number
  },
): { const(): Promise<string>; once(): Promise<string> }
export function bridgeAddress(
  effects: T.Effects,
  opts: { packageId: string; hostId: string; internalPort: number },
): { const(): Promise<string | null>; once(): Promise<string | null> }
export function bridgeAddress(
  effects: T.Effects,
  opts: {
    packageId: string
    hostId: string
    internalPort: number
    fallbackPort?: number
  },
) {
  const watchable = async () => {
    const osIp = await sdk.getOsIp(effects)
    return sdk.host.get(
      effects,
      { packageId: opts.packageId, hostId: opts.hostId },
      (host) => {
        const port =
          host?.bindings[opts.internalPort]?.net.assignedPort ??
          opts.fallbackPort
        if (port == null) return null
        return `${osIp}:${port}`
      },
    )
  }
  return {
    const: async () => (await watchable()).const(),
    once: async () => (await watchable()).once(),
  }
}

/**
 * bitcoind's RPC bridge address (`<osIp>:8332`) for mempool-config's `CORE_RPC`,
 * replacing `bitcoind.startos:8332`. `null` while bitcoind is absent — the
 * caller then omits `CORE_RPC` rather than writing a fake address; the
 * `.const()` heals with the real address when bitcoind reappears.
 */
export const bitcoindRpcBridge = (effects: T.Effects) =>
  bridgeAddress(effects, {
    packageId: 'bitcoind',
    hostId: rpcHostId,
    internalPort: rpcPort,
  }).const()

/**
 * LND's REST bridge address (`<osIp>:8080`), the base for `LND.REST_API_URL`.
 * LND terminates its own TLS against the mounted `tls.cert`, so the caller
 * prefixes `https://`. `null` until LND's REST binding publishes at
 * wallet-unlock — the caller then omits `LND` rather than writing a fake URL.
 */
export const lndRestBridge = (effects: T.Effects) =>
  bridgeAddress(effects, {
    packageId: 'lnd',
    hostId: controlHostId,
    internalPort: restPort,
  }).const()

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
