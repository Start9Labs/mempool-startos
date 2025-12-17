import { T } from '@start9labs/start-sdk'
import { bitcoinConfDefaults } from 'bitcoind-startos/startos/utils'
import { port as electrsPort } from 'electrs-startos/startos/utils'

export const uiPort = 8080
export const apiPort = 8999
export const dbPort = 3306
export const btcMountpoint = '/mnt/bitcoind'
export const lndMountpoint = '/mnt/lnd'
export const clnMountpoint = '/mnt/cln'

export interface TxIndexRes {
  result: {
    txindex: {
      synced: boolean
    }
  }
}
export interface IbdStateRes {
  result: {
    initialblockdownload: boolean
  }
}

export const determineSyncResponse = (
  txIndexRes: TxIndexRes,
  ibdStateRes: IbdStateRes,
): T.NamedHealthCheckResult => {
  if (ibdStateRes.result.initialblockdownload) {
    return {
      name: 'Transaction Indexer',
      result: 'loading',
      message:
        'Initial blockchain download still in progress. Mempool will not display correctly until this is complete.',
    }
  } else if (!txIndexRes.result.txindex.synced) {
    return {
      name: 'Transaction Indexer',
      result: 'loading',
      message:
        'Transaction Indexer is still syncing. Mempool will not display correctly until sync is complete.',
    }
  } else if (txIndexRes.result.txindex.synced) {
    return {
      name: 'Transaction Indexer',
      result: 'success',
      message: 'Fully synced.',
    }
  } else {
    return {
      name: 'Transaction Indexer',
      result: 'starting',
      message: 'Mempool is starting',
    }
  }
}

export const configJsonDefaults = {
  MEMPOOL: {
    OFFICIAL: false,
    NETWORK: 'mainnet' as const,
    BACKEND: 'none' as const,
    ENABLED: true,
    HTTP_PORT: 8999,
    SPAWN_CLUSTER_PROCS: 0,
    API_URL_PREFIX: '/api/v1/',
    POLL_RATE_MS: 2000,
    CACHE_DIR: './cache',
    CACHE_ENABLED: true,
    CLEAR_PROTECTION_MINUTES: 20,
    RECOMMENDED_FEE_PERCENTILE: 50,
    BLOCK_WEIGHT_UNITS: 4000000,
    INITIAL_BLOCKS_AMOUNT: 8,
    MEMPOOL_BLOCKS_AMOUNT: 8,
    INDEXING_BLOCKS_AMOUNT: 52560,
    BLOCKS_SUMMARIES_INDEXING: false,
    GOGGLES_INDEXING: false,
    USE_SECOND_NODE_FOR_MINFEE: false,
    EXTERNAL_ASSETS: [],
    EXTERNAL_MAX_RETRY: 1,
    EXTERNAL_RETRY_INTERVAL: 0,
    USER_AGENT: 'mempool',
    STDOUT_LOG_MIN_PRIORITY: 'info' as const,
    AUTOMATIC_POOLS_UPDATE: false,
    POOLS_JSON_URL:
      'https://raw.githubusercontent.com/mempool/mining-pools/master/pools-v2.json',
    POOLS_JSON_TREE_URL:
      'https://api.github.com/repos/mempool/mining-pools/git/trees/master',
    POOLS_UPDATE_DELAY: 604800,
    AUDIT: false,
    RUST_GBT: true,
    LIMIT_GBT: false,
    CPFP_INDEXING: false,
    DISK_CACHE_BLOCK_INTERVAL: 6,
    MAX_PUSH_TX_SIZE_WEIGHT: 4000000,
    ALLOW_UNREACHABLE: true,
    PRICE_UPDATES_PER_HOUR: 1,
    MAX_TRACKED_ADDRESSES: 100,
    UNIX_SOCKET_PATH: '',
  },
  CORE_RPC: {
    HOST: 'bitcoind.startos' as const,
    PORT: 8332,
    USERNAME: '',
    PASSWORD: '',
    TIMEOUT: 60000,
    COOKIE: true,
    COOKIE_PATH:
      `${btcMountpoint}/${bitcoinConfDefaults.rpccookiefile}` as const,
    DEBUG_LOG_PATH: '',
  },
  ELECTRUM: {
    HOST: 'electrs.startos' as const,
    PORT: electrsPort,
    TLS_ENABLED: false,
  },
  ESPLORA: {
    REST_API_URL: 'http://127.0.0.1:3000' as const,
    UNIX_SOCKET_PATH: '/tmp/esplora-bitcoin-mainnet',
    BATCH_QUERY_BASE_SIZE: 1000,
    RETRY_UNIX_SOCKET_AFTER: 30000,
    REQUEST_TIMEOUT: 10000,
    FALLBACK_TIMEOUT: 5000,
    FALLBACK: [],
    MAX_BEHIND_TIP: 2,
  },
  SECOND_CORE_RPC: {
    HOST: '',
    PORT: 8332,
    USERNAME: '',
    PASSWORD: '',
    TIMEOUT: 60000,
    COOKIE: false,
    COOKIE_PATH: '',
  },
  DATABASE: {
    ENABLED: true,
    HOST: '127.0.0.1',
    PORT: 3306,
    SOCKET: '',
    DATABASE: 'mempool' as const,
    USERNAME: 'mempool' as const,
    PASSWORD: 'password', // @TODO don't do this
    TIMEOUT: 180000,
    PID_DIR: '',
  },
  SYSLOG: {
    ENABLED: true,
    HOST: '127.0.0.1' as const,
    PORT: 514,
    MIN_PRIORITY: 'info' as const,
    FACILITY: 'local7',
  },
  STATISTICS: {
    ENABLED: true,
    TX_PER_SECOND_SAMPLE_PERIOD: 150,
  },
  MAXMIND: {
    ENABLED: false,
    GEOLITE2_CITY: '/usr/local/share/GeoIP/GeoLite2-City.mmdb' as const,
    GEOLITE2_ASN: '/usr/local/share/GeoIP/GeoLite2-ASN.mmdb' as const,
    GEOIP2_ISP: '/usr/local/share/GeoIP/GeoIP2-ISP.mmdb' as const,
  },
  LIGHTNING: {
    ENABLED: false,
    BACKEND: 'lnd' as const,
    STATS_REFRESH_INTERVAL: 3600,
    GRAPH_REFRESH_INTERVAL: 3600,
    LOGGER_UPDATE_INTERVAL: 30,
    FORENSICS_INTERVAL: 43200,
    FORENSICS_RATE_LIMIT: 20,
  },
  LND: {
    TLS_CERT_PATH: `${lndMountpoint}/tls.cert`,
    MACAROON_PATH: `${lndMountpoint}/readonly.macaroon`,
    REST_API_URL: 'https://lnd.startos:8080' as const,
    TIMEOUT: 10000,
  },
  CLIGHTNING: {
    SOCKET: `${clnMountpoint}/lightning-rpc`,
  },
  SOCKS5PROXY: {
    ENABLED: false,
    USE_ONION: true,
    HOST: 'startos' as const,
    PORT: 9050 as const,
    USERNAME: '',
    PASSWORD: '',
  },
  EXTERNAL_DATA_SERVER: {
    MEMPOOL_API: 'https://mempool.space/api/v1',
    MEMPOOL_ONION:
      'http://mempoolhqx4isw62xs7abwphsq7ldayuidyx2v2oethdhhj6mlo2r6ad.onion/api/v1',
    LIQUID_API: 'https://liquid.network/api/v1',
    LIQUID_ONION:
      'http://liquidmom47f6s3m53ebfxn47p76a6tlnxib3wp6deux7wuzotdr6cyd.onion/api/v1',
  },
  REDIS: {
    ENABLED: false,
    UNIX_SOCKET_PATH: '/tmp/redis.sock',
    BATCH_QUERY_BASE_SIZE: 5000,
  },
  REPLICATION: {
    ENABLED: false,
    AUDIT: false,
    AUDIT_START_HEIGHT: 774000,
    STATISTICS: false,
    STATISTICS_START_TIME: 1481932800,
    SERVERS: [],
  },
  MEMPOOL_SERVICES: {
    API: 'https://mempool.space/api/v1/services' as const,
    ACCELERATIONS: false,
  },
  STRATUM: {
    ENABLED: false,
    API: '',
  },
  FIAT_PRICE: {
    ENABLED: true,
    PAID: false,
    API_KEY: '',
  },
}
