import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { btcMountpoint, lndMountpoint, clnMountpoint } from '../utils'

const mempoolSection = z.object({
  // enforced
  BACKEND: z.literal('electrum').catch('electrum'),
  // configurable
  OFFICIAL: z.boolean().catch(false),
  NETWORK: z.enum(['mainnet', 'testnet']).catch('mainnet'),
  ENABLED: z.boolean().catch(true),
  HTTP_PORT: z.number().catch(8999),
  SPAWN_CLUSTER_PROCS: z.number().catch(0),
  API_URL_PREFIX: z.string().catch('/api/v1/'),
  POLL_RATE_MS: z.number().catch(2000),
  CACHE_DIR: z.string().catch('./cache'),
  CACHE_ENABLED: z.boolean().catch(true),
  CLEAR_PROTECTION_MINUTES: z.number().catch(20),
  RECOMMENDED_FEE_PERCENTILE: z.number().catch(50),
  BLOCK_WEIGHT_UNITS: z.number().catch(4000000),
  INITIAL_BLOCKS_AMOUNT: z.number().catch(8),
  MEMPOOL_BLOCKS_AMOUNT: z.number().catch(8),
  INDEXING_BLOCKS_AMOUNT: z.number().catch(52560),
  BLOCKS_SUMMARIES_INDEXING: z.boolean().catch(false),
  GOGGLES_INDEXING: z.boolean().catch(false),
  USE_SECOND_NODE_FOR_MINFEE: z.boolean().catch(false),
  EXTERNAL_ASSETS: z.array(z.string()).catch([]),
  EXTERNAL_MAX_RETRY: z.number().catch(1),
  EXTERNAL_RETRY_INTERVAL: z.number().catch(0),
  USER_AGENT: z.string().catch('mempool'),
  STDOUT_LOG_MIN_PRIORITY: z
    .enum(['trade', 'debug', 'info', 'warn', 'error'])
    .catch('info'),
  AUTOMATIC_POOLS_UPDATE: z.boolean().catch(false),
  POOLS_JSON_URL: z
    .string()
    .catch(
      'https://raw.githubusercontent.com/mempool/mining-pools/master/pools-v2.json',
    ),
  POOLS_JSON_TREE_URL: z
    .string()
    .catch(
      'https://api.github.com/repos/mempool/mining-pools/git/trees/master',
    ),
  POOLS_UPDATE_DELAY: z.number().catch(604800),
  AUDIT: z.boolean().catch(false),
  RUST_GBT: z.boolean().catch(true),
  LIMIT_GBT: z.boolean().catch(false),
  CPFP_INDEXING: z.boolean().catch(false),
  DISK_CACHE_BLOCK_INTERVAL: z.number().catch(6),
  MAX_PUSH_TX_SIZE_WEIGHT: z.number().catch(4000000),
  ALLOW_UNREACHABLE: z.boolean().catch(true),
  PRICE_UPDATES_PER_HOUR: z.number().catch(1),
  MAX_TRACKED_ADDRESSES: z.number().catch(100),
  UNIX_SOCKET_PATH: z.string().catch(''),
})

const coreRpcSection = z.object({
  // enforced
  HOST: z.literal('bitcoind.startos').catch('bitcoind.startos'),
  PORT: z.literal(8332).catch(8332),
  COOKIE_PATH: z
    .literal(`${btcMountpoint}/.cookie`)
    .catch(`${btcMountpoint}/.cookie`),
  // configurable
  USERNAME: z.string().catch(''),
  PASSWORD: z.string().catch(''),
  TIMEOUT: z.number().catch(60000),
  COOKIE: z.boolean().catch(true),
  DEBUG_LOG_PATH: z.string().catch(''),
})

const electrumSection = z.object({
  // configurable
  HOST: z
    .enum(['electrs.startos', 'fulcrum.startos'])
    .optional()
    .catch(undefined),
  PORT: z.number().optional().catch(50001),
  TLS_ENABLED: z.boolean().optional().catch(false),
})

const databaseSection = z.object({
  // enforced
  ENABLED: z.literal(true).catch(true),
  HOST: z.literal('127.0.0.1').catch('127.0.0.1'),
  PORT: z.literal(3306).catch(3306),
  SOCKET: z.literal('').catch(''),
  DATABASE: z.literal('mempool').catch('mempool'),
  USERNAME: z.literal('mempool').catch('mempool'),
  // configurable
  PASSWORD: z.string().catch(''),
  TIMEOUT: z.number().catch(180000),
  PID_DIR: z.string().catch(''),
})

const syslogSection = z.object({
  // enforced
  ENABLED: z.literal(false).catch(false),
})

const statisticsSection = z.object({
  // configurable
  ENABLED: z.boolean().catch(true),
  TX_PER_SECOND_SAMPLE_PERIOD: z.number().catch(150),
})

const maxmindSection = z.object({
  // enforced
  ENABLED: z.literal(false).catch(false),
})

const lightningSection = z.object({
  // configurable
  ENABLED: z.boolean().catch(false),
  BACKEND: z.enum(['lnd', 'cln']).catch('lnd'),
  STATS_REFRESH_INTERVAL: z.number().catch(3600),
  GRAPH_REFRESH_INTERVAL: z.number().catch(3600),
  LOGGER_UPDATE_INTERVAL: z.number().catch(30),
  FORENSICS_INTERVAL: z.number().catch(43200),
  FORENSICS_RATE_LIMIT: z.number().catch(20),
})

const lndSection = z.object({
  // enforced
  TLS_CERT_PATH: z
    .literal(`${lndMountpoint}/tls.cert`)
    .catch(`${lndMountpoint}/tls.cert`),
  MACAROON_PATH: z
    .literal(`${lndMountpoint}/readonly.macaroon`)
    .catch(`${lndMountpoint}/readonly.macaroon`),
  REST_API_URL: z
    .literal('https://lnd.startos:8080')
    .catch('https://lnd.startos:8080'),
  // configurable
  TIMEOUT: z.number().catch(10000),
})

const clightningSection = z.object({
  // enforced
  SOCKET: z
    .literal(`${clnMountpoint}/lightning-rpc`)
    .catch(`${clnMountpoint}/lightning-rpc`),
})

const socks5ProxySection = z.object({
  // enforced
  HOST: z.literal('startos').catch('startos'),
  PORT: z.literal(9050).catch(9050),
  // configurable
  ENABLED: z.boolean().catch(false),
  USE_ONION: z.boolean().catch(true),
  USERNAME: z.string().catch(''),
  PASSWORD: z.string().catch(''),
})

const externalDataServerSection = z.object({
  // configurable
  MEMPOOL_API: z.string().catch('https://mempool.space/api/v1'),
  MEMPOOL_ONION: z
    .string()
    .catch(
      'http://mempoolhqx4isw62xs7abwphsq7ldayuidyx2v2oethdhhj6mlo2r6ad.onion/api/v1',
    ),
  LIQUID_API: z.string().catch('https://liquid.network/api/v1'),
  LIQUID_ONION: z
    .string()
    .catch(
      'http://liquidmom47f6s3m53ebfxn47p76a6tlnxib3wp6deux7wuzotdr6cyd.onion/api/v1',
    ),
})

const redisSection = z.object({
  // enforced
  ENABLED: z.literal(false).catch(false),
})

const replicationSection = z.object({
  // enforced
  ENABLED: z.literal(false).catch(false),
})

const mempoolServicesSection = z.object({
  // enforced
  API: z
    .literal('https://mempool.space/api/v1/services')
    .catch('https://mempool.space/api/v1/services'),
  // configurable
  ACCELERATIONS: z.boolean().catch(false),
})

const stratumSection = z.object({
  // enforced
  ENABLED: z.literal(false).catch(false),
})

const fiatPriceSection = z.object({
  // configurable
  ENABLED: z.boolean().catch(true),
  PAID: z.boolean().catch(false),
  API_KEY: z.string().catch(''),
})

const shape = z.object({
  MEMPOOL: mempoolSection.catch(() => mempoolSection.parse({})),
  CORE_RPC: coreRpcSection.catch(() => coreRpcSection.parse({})),
  ELECTRUM: electrumSection.catch(() => electrumSection.parse({})),
  DATABASE: databaseSection.catch(() => databaseSection.parse({})),
  SYSLOG: syslogSection.catch(() => syslogSection.parse({})),
  STATISTICS: statisticsSection.catch(() => statisticsSection.parse({})),
  MAXMIND: maxmindSection.catch(() => maxmindSection.parse({})),
  LIGHTNING: lightningSection.catch(() => lightningSection.parse({})),
  LND: lndSection.catch(() => lndSection.parse({})),
  CLIGHTNING: clightningSection.catch(() => clightningSection.parse({})),
  SOCKS5PROXY: socks5ProxySection.catch(() => socks5ProxySection.parse({})),
  EXTERNAL_DATA_SERVER: externalDataServerSection.catch(() =>
    externalDataServerSection.parse({}),
  ),
  REDIS: redisSection.catch(() => redisSection.parse({})),
  REPLICATION: replicationSection.catch(() => replicationSection.parse({})),
  MEMPOOL_SERVICES: mempoolServicesSection.catch(() =>
    mempoolServicesSection.parse({}),
  ),
  STRATUM: stratumSection.catch(() => stratumSection.parse({})),
  FIAT_PRICE: fiatPriceSection.catch(() => fiatPriceSection.parse({})),
})

export const configJson = FileHelper.json(
  {
    base: sdk.volumes.config,
    subpath: '/mempool-config.json',
  },
  shape,
)

export type ConfigJson = z.infer<typeof shape>
