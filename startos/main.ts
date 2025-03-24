import { sdk } from './sdk'
import { T } from '@start9labs/start-sdk'
import {
  apiPort,
  dbPort,
  determineResponse,
  IbdStateRes,
  TxIndexRes,
  uiPort,
} from './utils'
import { readFile } from 'fs/promises'

export const backendMounts = sdk.Mounts.of().addVolume(
  'backend',
  null,
  '/backend/cache',
  false,
)

export const main = sdk.setupMain(async ({ effects, started }) => {
  console.info('Starting Mempool!')

  const syncHealthCheck = sdk.HealthCheck.of(effects, {
    name: 'Transaction Indexer',
    fn: async () => {
      // @TODO update with path to bitcoin cookie file
      const auth = await readFile('', {
        encoding: 'base64',
      })
      // @TODO update url and port from bitcoin config
      const txIndexReq = fetch('http://bitcoind.embassy:8332', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          jsonrpc: '1.0',
          id: 'sync-hck',
          method: 'getindexinfo',
          params: ['txindex'],
        }),
      })
        .then(async (res: any) => {
          const jsonRes = (await res.json()) as TxIndexRes
          // @TODO remove me after testing
          console.log(`Tx index response is: ${res}`)
          console.log(`Tx index response parsed as json: ${jsonRes}`)
          return jsonRes
        })
        .catch((e: any) => {
          throw new Error(e)
        })

      // @TODO update url and port from bitcoin config
      const ibdStateReq = fetch('http://bitcoind.embassy:8332', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          jsonrpc: '1.0',
          id: 'sync-hck',
          method: 'getblockchaininfo',
          params: [],
        }),
      })
        .then(async (res: any) => {
          const jsonRes = (await res.json()) as IbdStateRes
          // @TODO remove me after testing
          console.log(`IBD response is: ${res}`)
          console.log(`IBD response parsed as json: ${jsonRes}`)
          return jsonRes
        })
        .catch((e: any) => {
          throw new Error(e)
        })

      const [txIndexRes, ibdStateRes] = await Promise.all([
        txIndexReq,
        ibdStateReq,
      ])
      return determineResponse(txIndexRes, ibdStateRes)
    },
  })

  const healthReceipts: T.HealthReceipt[] = []

  return sdk.Daemons.of(effects, started, healthReceipts)
    .addDaemon('mariadb', {
      image: { id: 'mariadb' },
      command: [
        '/usr/bin/mysqld_safe',
        '--user=mysql',
        "--datadir='/var/lib/mysql",
      ],
      mounts: sdk.Mounts.of().addVolume(
        'mariadb',
        null,
        '/var/lib/mysql',
        false,
      ),
      env: {
        MYSQL_DATABASE: 'mempool',
        MYSQL_USER: 'mempool',
        MYSQL_PASSWORD: 'mempool',
        MYSQL_ROOT_PASSWORD: 'admin',
      },
      ready: {
        display: 'Database',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, dbPort, {
            successMessage: 'The database is ready',
            errorMessage: 'The database is not ready',
          }),
      },
      requires: [],
    })
    .addDaemon('api', {
      image: { id: 'backend' },
      command: [
        '/backend/wait-for-it.sh',
        `localhost:${dbPort}`,
        '--timeout=720',
        '--strict',
        '-- ./start.sh',
      ],
      mounts: backendMounts,
      ready: {
        display: 'API',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, apiPort, {
            successMessage: 'The API is ready',
            errorMessage: 'The API is not ready',
          }),
      },
      requires: ['mariadb'],
    })
    .addDaemon('webui', {
      image: { id: 'frontend' },
      command: ['nginx', '-g', "'daemon off;'"],
      mounts: sdk.Mounts.of().addVolume('frontend', null, '/root', false),
      ready: {
        display: 'Web Interface',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: 'The web interface is ready',
            errorMessage: 'The web interface is not ready',
          }),
      },
      requires: ['api'],
    })
})
