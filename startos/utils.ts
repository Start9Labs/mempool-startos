import { T, utils } from '@start9labs/start-sdk'
import { totalmem } from 'os'
import { rpcHostId, rpcPort } from 'bitcoin-core-startos/startos/utils'
import { controlHostId, restPort } from 'lnd-startos/startos/interfaces'
import { socksHostId, socksPort } from 'tor-startos/startos/utils'
import { storeJson } from './file-models/store.json'
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
export const poolsPort = 8998
export const btcMountpoint = '/mnt/bitcoind'
export const lndMountpoint = '/mnt/lnd'
export const clnMountpoint = '/mnt/cln'

export const lndCertPath = `${lndMountpoint}/tls.cert`
export const lndMacaroonPath = `${lndMountpoint}/data/chain/bitcoin/mainnet/readonly.macaroon`

/** A bridge address is always `<ipv4>:<port>`; split it into a HOST/PORT pair. */
export const hostPort = (addr: string) => {
  const i = addr.lastIndexOf(':')
  return { HOST: addr.slice(0, i), PORT: Number(addr.slice(i + 1)) }
}

// Upstream's retry loop is `while (retry < EXTERNAL_MAX_RETRY)`, so the previous
// value of 1 meant a single attempt with no backoff for the price feeds and the
// pools fetch. It also capped the pools updater's Tor circuit rotation, which
// puts each retry on a fresh circuit (`circuit<n>` as the SOCKS username) — at 1
// there was never a second circuit to try. Single source of truth: referenced by
// the file model defaults and by the 3.3.1:23 migration that rewrites the value
// older installs already have.
export const EXTERNAL_RETRY = {
  EXTERNAL_MAX_RETRY: 3,
  EXTERNAL_RETRY_INTERVAL: 5,
}

/**
 * The two places the backend can fetch `pools-v2.json` and its sha from, as
 * `MEMPOOL.POOLS_JSON_URL` / `POOLS_JSON_TREE_URL`. Upstream treats a missing
 * sha as fatal — `index.ts` exits 1 rather than start without one — so a fresh
 * database plus an unreachable source is an unrecoverable boot loop. `local` is
 * the bundled snapshot served by the `pools` daemon, which needs no network at
 * all. Tor cannot reach loopback, so enabling the SOCKS proxy switches to
 * `github`; init/watchTorProxy owns the choice.
 */
export const poolsSource = {
  local: {
    json: `http://127.0.0.1:${poolsPort}/pools-v2.json`,
    tree: `http://127.0.0.1:${poolsPort}/tree`,
  },
  github: {
    json: 'https://raw.githubusercontent.com/mempool/mining-pools/master/pools-v2.json',
    tree: 'https://api.github.com/repos/mempool/mining-pools/git/trees/master',
  },
}

/**
 * bitcoind's RPC bridge address (`<osIp>:8332`) for mempool-config's `CORE_RPC`,
 * replacing `bitcoind.startos:8332`. `null` while bitcoind is absent — the
 * caller then omits `CORE_RPC` rather than writing a fake address; the
 * `.const()` heals with the real address when bitcoind reappears.
 */
export const bitcoindRpcBridge = (effects: T.Effects) =>
  sdk.host
    .getBridgeAddress(effects, {
      packageId: 'bitcoind',
      hostId: rpcHostId,
      internalPort: rpcPort,
      ssl: false,
    })
    .const()

/**
 * LND's REST bridge address (`<osIp>:8080`), the base for `LND.REST_API_URL`.
 * LND terminates its own TLS against the mounted `tls.cert`, so the caller
 * prefixes `https://`. `null` until LND's REST binding publishes at
 * wallet-unlock — the caller then omits `LND` rather than writing a fake URL.
 */
export const lndRestBridge = (effects: T.Effects) =>
  sdk.host
    .getBridgeAddress(effects, {
      packageId: 'lnd',
      hostId: controlHostId,
      internalPort: restPort,
    })
    .const()

/**
 * Tor's SOCKS bridge address (`<osIp>:9050`) for mempool-config's `SOCKS5PROXY`.
 * No `fallbackPort`: this proxy anonymizes every external request the backend
 * makes, so when tor is absent the helper resolves `null` and the caller writes
 * no proxy rather than leaking the traffic to a dead port. The `.const()` heals
 * when tor appears.
 */
export const torSocksBridge = (effects: T.Effects) =>
  sdk.host
    .getBridgeAddress(effects, {
      packageId: 'tor',
      hostId: socksHostId,
      internalPort: socksPort,
    })
    .const()

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
 * The user's selected Electrum indexer, StartOS state held in store.json (not in
 * the upstream mempool-config.json). Installs predating store.json are seeded
 * from the legacy `<indexer>.startos` value in ELECTRUM.HOST by the 3.3.1:16
 * migration, so no runtime fallback is needed here.
 */
export async function selectedIndexer(
  effects: T.Effects,
): Promise<Indexer | undefined> {
  return (await storeJson.read((s) => s.indexer).const(effects)) ?? undefined
}

/**
 * The selected indexer's plaintext (non-TLS) Electrum bridge address
 * (`<osIp>:50001`), replacing `<indexer>.startos:50001`. `null` while the
 * indexer is absent — the caller then omits `ELECTRUM.HOST`/`PORT` rather than
 * writing a fake address; the `.const()` heals when it reappears.
 */
export const electrumBridge = (effects: T.Effects, indexer: Indexer) => {
  const { packageId, hostId } = INDEXER_HOSTS[indexer]
  return sdk.host
    .getBridgeAddress(effects, {
      packageId,
      hostId,
      internalPort: electrumPort,
      ssl: false,
    })
    .const()
}

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

// totalmem() is the service-container share, not host RAM: StartOS caps it 1 GiB
// below MemTotal, so a 16 GB device reports ~14.6 GiB — less with an iGPU carve-out.
export const LOW_RAM_BYTES = 12 * 1024 ** 3

export const isLowRam = () => totalmem() < LOW_RAM_BYTES
