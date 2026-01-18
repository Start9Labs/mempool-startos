import { matches, FileHelper } from '@start9labs/start-sdk'
import { configJsonDefaults as c } from '../utils'
import { sdk } from '../sdk'
const { object, string, boolean, number, array, literal, literals } = matches

const shape = object({
  MEMPOOL: object({
    OFFICIAL: boolean.onMismatch(c.MEMPOOL.OFFICIAL),
    NETWORK: literals('mainnet', 'testnet').onMismatch(c.MEMPOOL.NETWORK),
    BACKEND: literal('electrum').onMismatch(c.MEMPOOL.BACKEND),
    ENABLED: boolean.onMismatch(c.MEMPOOL.ENABLED),
    HTTP_PORT: number.onMismatch(c.MEMPOOL.HTTP_PORT),
    SPAWN_CLUSTER_PROCS: number.onMismatch(c.MEMPOOL.SPAWN_CLUSTER_PROCS),
    API_URL_PREFIX: string.onMismatch(c.MEMPOOL.API_URL_PREFIX),
    POLL_RATE_MS: number.onMismatch(c.MEMPOOL.POLL_RATE_MS),
    CACHE_DIR: string.onMismatch(c.MEMPOOL.CACHE_DIR),
    CACHE_ENABLED: boolean.onMismatch(c.MEMPOOL.CACHE_ENABLED),
    CLEAR_PROTECTION_MINUTES: number.onMismatch(
      c.MEMPOOL.CLEAR_PROTECTION_MINUTES,
    ),
    RECOMMENDED_FEE_PERCENTILE: number.onMismatch(
      c.MEMPOOL.RECOMMENDED_FEE_PERCENTILE,
    ),
    BLOCK_WEIGHT_UNITS: number.onMismatch(c.MEMPOOL.BLOCK_WEIGHT_UNITS),
    INITIAL_BLOCKS_AMOUNT: number.onMismatch(c.MEMPOOL.INITIAL_BLOCKS_AMOUNT),
    MEMPOOL_BLOCKS_AMOUNT: number.onMismatch(c.MEMPOOL.MEMPOOL_BLOCKS_AMOUNT),
    INDEXING_BLOCKS_AMOUNT: number.onMismatch(c.MEMPOOL.INDEXING_BLOCKS_AMOUNT),
    BLOCKS_SUMMARIES_INDEXING: boolean.onMismatch(
      c.MEMPOOL.BLOCKS_SUMMARIES_INDEXING,
    ),
    GOGGLES_INDEXING: boolean.onMismatch(c.MEMPOOL.GOGGLES_INDEXING),
    USE_SECOND_NODE_FOR_MINFEE: boolean.onMismatch(
      c.MEMPOOL.USE_SECOND_NODE_FOR_MINFEE,
    ),
    EXTERNAL_ASSETS: array(string).onMismatch(c.MEMPOOL.EXTERNAL_ASSETS),
    EXTERNAL_MAX_RETRY: number.onMismatch(c.MEMPOOL.EXTERNAL_MAX_RETRY),
    EXTERNAL_RETRY_INTERVAL: number.onMismatch(
      c.MEMPOOL.EXTERNAL_RETRY_INTERVAL,
    ),
    USER_AGENT: string.onMismatch(c.MEMPOOL.USER_AGENT),
    STDOUT_LOG_MIN_PRIORITY: literals(
      'trade',
      'debug',
      'info',
      'warn',
      'error',
    ).onMismatch(c.MEMPOOL.STDOUT_LOG_MIN_PRIORITY),
    AUTOMATIC_POOLS_UPDATE: boolean.onMismatch(
      c.MEMPOOL.AUTOMATIC_POOLS_UPDATE,
    ),
    POOLS_JSON_URL: string.onMismatch(c.MEMPOOL.POOLS_JSON_URL),
    POOLS_JSON_TREE_URL: string.onMismatch(c.MEMPOOL.POOLS_JSON_TREE_URL),
    POOLS_UPDATE_DELAY: number.onMismatch(c.MEMPOOL.POOLS_UPDATE_DELAY),
    AUDIT: boolean.onMismatch(c.MEMPOOL.AUDIT),
    RUST_GBT: boolean.onMismatch(c.MEMPOOL.RUST_GBT),
    LIMIT_GBT: boolean.onMismatch(c.MEMPOOL.LIMIT_GBT),
    CPFP_INDEXING: boolean.onMismatch(c.MEMPOOL.CPFP_INDEXING),
    DISK_CACHE_BLOCK_INTERVAL: number.onMismatch(
      c.MEMPOOL.DISK_CACHE_BLOCK_INTERVAL,
    ),
    MAX_PUSH_TX_SIZE_WEIGHT: number.onMismatch(
      c.MEMPOOL.MAX_PUSH_TX_SIZE_WEIGHT,
    ),
    ALLOW_UNREACHABLE: boolean.onMismatch(c.MEMPOOL.ALLOW_UNREACHABLE),
    PRICE_UPDATES_PER_HOUR: number.onMismatch(c.MEMPOOL.PRICE_UPDATES_PER_HOUR),
    MAX_TRACKED_ADDRESSES: number.onMismatch(c.MEMPOOL.MAX_TRACKED_ADDRESSES),
    UNIX_SOCKET_PATH: string.onMismatch(c.MEMPOOL.UNIX_SOCKET_PATH),
  }),
  CORE_RPC: object({
    HOST: literal(c.CORE_RPC.HOST).onMismatch(c.CORE_RPC.HOST),
    PORT: literal(c.CORE_RPC.PORT).onMismatch(c.CORE_RPC.PORT),
    USERNAME: string.onMismatch(c.CORE_RPC.USERNAME),
    PASSWORD: string.onMismatch(c.CORE_RPC.PASSWORD),
    TIMEOUT: number.onMismatch(c.CORE_RPC.TIMEOUT),
    COOKIE: boolean.onMismatch(c.CORE_RPC.COOKIE),
    COOKIE_PATH: literal(c.CORE_RPC.COOKIE_PATH).onMismatch(
      c.CORE_RPC.COOKIE_PATH,
    ),
    DEBUG_LOG_PATH: string.onMismatch(c.CORE_RPC.DEBUG_LOG_PATH),
  }),
  ELECTRUM: object({
    HOST: literals('electrs.startos', 'fulcrum.startos')
      .optional()
      .onMismatch(c.ELECTRUM.HOST),
    PORT: number.optional().onMismatch(c.ELECTRUM.PORT),
    TLS_ENABLED: boolean.optional().onMismatch(c.ELECTRUM.TLS_ENABLED),
  }),
  ESPLORA: object({
    REST_API_URL: literal(c.ESPLORA.REST_API_URL).onMismatch(
      c.ESPLORA.REST_API_URL,
    ),
    UNIX_SOCKET_PATH: literal(c.ESPLORA.UNIX_SOCKET_PATH).onMismatch(
      c.ESPLORA.UNIX_SOCKET_PATH,
    ),
    BATCH_QUERY_BASE_SIZE: number.onMismatch(c.ESPLORA.BATCH_QUERY_BASE_SIZE),
    RETRY_UNIX_SOCKET_AFTER: number.onMismatch(
      c.ESPLORA.RETRY_UNIX_SOCKET_AFTER,
    ),
    REQUEST_TIMEOUT: number.onMismatch(c.ESPLORA.REQUEST_TIMEOUT),
    FALLBACK_TIMEOUT: number.onMismatch(c.ESPLORA.FALLBACK_TIMEOUT),
    FALLBACK: array(string).onMismatch(c.ESPLORA.FALLBACK),
    MAX_BEHIND_TIP: number.onMismatch(c.ESPLORA.MAX_BEHIND_TIP),
  }),
  SECOND_CORE_RPC: object({
    HOST: literal(c.SECOND_CORE_RPC.HOST).onMismatch(c.SECOND_CORE_RPC.HOST),
    PORT: literal(c.SECOND_CORE_RPC.PORT).onMismatch(c.SECOND_CORE_RPC.PORT),
    USERNAME: string.onMismatch(c.SECOND_CORE_RPC.USERNAME),
    PASSWORD: string.onMismatch(c.SECOND_CORE_RPC.PASSWORD),
    TIMEOUT: number.onMismatch(c.SECOND_CORE_RPC.TIMEOUT),
    COOKIE: boolean.onMismatch(c.SECOND_CORE_RPC.COOKIE),
    COOKIE_PATH: literal(c.SECOND_CORE_RPC.COOKIE_PATH).onMismatch(
      c.SECOND_CORE_RPC.COOKIE_PATH,
    ),
  }),
  DATABASE: object({
    ENABLED: literal(c.DATABASE.ENABLED).onMismatch(c.DATABASE.ENABLED),
    HOST: literal(c.DATABASE.HOST).onMismatch(c.DATABASE.HOST),
    PORT: literal(c.DATABASE.PORT).onMismatch(c.DATABASE.PORT),
    SOCKET: literal(c.DATABASE.SOCKET).onMismatch(c.DATABASE.SOCKET),
    DATABASE: literal(c.DATABASE.DATABASE).onMismatch(c.DATABASE.DATABASE),
    USERNAME: literal(c.DATABASE.USERNAME).onMismatch(c.DATABASE.USERNAME),
    PASSWORD: literal(c.DATABASE.PASSWORD).onMismatch(c.DATABASE.PASSWORD),
    TIMEOUT: number.onMismatch(c.DATABASE.TIMEOUT),
    PID_DIR: string.onMismatch(c.DATABASE.PID_DIR),
  }),
  SYSLOG: object({
    ENABLED: boolean.onMismatch(c.SYSLOG.ENABLED),
    HOST: literal(c.SYSLOG.HOST).onMismatch(c.SYSLOG.HOST),
    PORT: number.onMismatch(c.SYSLOG.PORT),
    MIN_PRIORITY: literals('debug', 'info', 'error').onMismatch(
      c.SYSLOG.MIN_PRIORITY,
    ),
    FACILITY: string.onMismatch(c.SYSLOG.FACILITY),
  }),
  STATISTICS: object({
    ENABLED: boolean.onMismatch(c.STATISTICS.ENABLED),
    TX_PER_SECOND_SAMPLE_PERIOD: number.onMismatch(
      c.STATISTICS.TX_PER_SECOND_SAMPLE_PERIOD,
    ),
  }),
  MAXMIND: object({
    ENABLED: boolean.onMismatch(c.MAXMIND.ENABLED),
    GEOLITE2_CITY: literal(c.MAXMIND.GEOLITE2_CITY).onMismatch(
      c.MAXMIND.GEOLITE2_CITY,
    ),
    GEOLITE2_ASN: literal(c.MAXMIND.GEOLITE2_ASN).onMismatch(
      c.MAXMIND.GEOLITE2_ASN,
    ),
    GEOIP2_ISP: literal(c.MAXMIND.GEOIP2_ISP).onMismatch(c.MAXMIND.GEOIP2_ISP),
  }),
  LIGHTNING: object({
    ENABLED: boolean.onMismatch(c.LIGHTNING.ENABLED),
    BACKEND: literals('lnd', 'cln').onMismatch(c.LIGHTNING.BACKEND),
    STATS_REFRESH_INTERVAL: number.onMismatch(
      c.LIGHTNING.STATS_REFRESH_INTERVAL,
    ),
    GRAPH_REFRESH_INTERVAL: number.onMismatch(
      c.LIGHTNING.GRAPH_REFRESH_INTERVAL,
    ),
    LOGGER_UPDATE_INTERVAL: number.onMismatch(
      c.LIGHTNING.LOGGER_UPDATE_INTERVAL,
    ),
    FORENSICS_INTERVAL: number.onMismatch(c.LIGHTNING.FORENSICS_INTERVAL),
    FORENSICS_RATE_LIMIT: number.onMismatch(c.LIGHTNING.FORENSICS_RATE_LIMIT),
  }),
  LND: object({
    TLS_CERT_PATH: literal(c.LND.TLS_CERT_PATH).onMismatch(c.LND.TLS_CERT_PATH),
    MACAROON_PATH: literal(c.LND.MACAROON_PATH).onMismatch(c.LND.MACAROON_PATH),
    REST_API_URL: literal(c.LND.REST_API_URL).onMismatch(c.LND.REST_API_URL),
    TIMEOUT: number.onMismatch(c.LND.TIMEOUT),
  }),
  CLIGHTNING: object({
    SOCKET: literal(c.CLIGHTNING.SOCKET),
  }),
  SOCKS5PROXY: object({
    ENABLED: boolean.onMismatch(c.SOCKS5PROXY.ENABLED),
    USE_ONION: boolean.onMismatch(c.SOCKS5PROXY.USE_ONION),
    HOST: literal(c.SOCKS5PROXY.HOST).onMismatch(c.SOCKS5PROXY.HOST),
    PORT: literal(c.SOCKS5PROXY.PORT).onMismatch(c.SOCKS5PROXY.PORT),
    USERNAME: string.onMismatch(c.SOCKS5PROXY.USERNAME),
    PASSWORD: string.onMismatch(c.SOCKS5PROXY.PASSWORD),
  }),
  EXTERNAL_DATA_SERVER: object({
    MEMPOOL_API: string.onMismatch(c.EXTERNAL_DATA_SERVER.MEMPOOL_API),
    MEMPOOL_ONION: string.onMismatch(c.EXTERNAL_DATA_SERVER.MEMPOOL_ONION),
    LIQUID_API: string.onMismatch(c.EXTERNAL_DATA_SERVER.LIQUID_API),
    LIQUID_ONION: string.onMismatch(c.EXTERNAL_DATA_SERVER.LIQUID_ONION),
  }),
  REDIS: object({
    ENABLED: boolean.onMismatch(c.REDIS.ENABLED),
    UNIX_SOCKET_PATH: string.onMismatch(c.REDIS.UNIX_SOCKET_PATH),
    BATCH_QUERY_BASE_SIZE: number.onMismatch(c.REDIS.BATCH_QUERY_BASE_SIZE),
  }),
  REPLICATION: object({
    ENABLED: boolean.onMismatch(c.REPLICATION.ENABLED),
    AUDIT: boolean.onMismatch(c.REPLICATION.AUDIT),
    AUDIT_START_HEIGHT: number.onMismatch(c.REPLICATION.AUDIT_START_HEIGHT),
    STATISTICS: boolean.onMismatch(c.REPLICATION.STATISTICS),
    STATISTICS_START_TIME: number.onMismatch(
      c.REPLICATION.STATISTICS_START_TIME,
    ),
    SERVERS: array(string).onMismatch(c.REPLICATION.SERVERS),
  }),
  MEMPOOL_SERVICES: object({
    API: literal(c.MEMPOOL_SERVICES.API).onMismatch(c.MEMPOOL_SERVICES.API),
    ACCELERATIONS: boolean.onMismatch(c.MEMPOOL_SERVICES.ACCELERATIONS),
  }),
  STRATUM: object({
    ENABLED: literal(c.STRATUM.ENABLED).onMismatch(c.STRATUM.ENABLED),
    API: string.onMismatch(c.STRATUM.API),
  }),
  FIAT_PRICE: object({
    ENABLED: boolean.onMismatch(c.FIAT_PRICE.ENABLED),
    PAID: boolean.onMismatch(c.FIAT_PRICE.PAID),
    API_KEY: string.onMismatch(c.FIAT_PRICE.API_KEY),
  }),
})

export const configJson = FileHelper.json(
  {
    base: sdk.volumes.config,
    subpath: '/mempool-config.json',
  },
  shape,
)

export type ConfigJson = typeof shape._TYPE
