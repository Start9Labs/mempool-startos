import { sdk } from './sdk'
import { SubContainer, T } from '@start9labs/start-sdk'
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
    id: 'tx-indexer',
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

  const additionalChecks: T.HealthCheck[] = []

  return sdk.Daemons.of(effects, started, additionalChecks)
    .addDaemon('mariadb', {
      subcontainer: await SubContainer.of(
        effects,
        { imageId: 'mariadb' },
        sdk.Mounts.of().addVolume('mariadb', null, '/var/lib/mysql', false),
        'database',
      ),
      command: [
        '/usr/bin/mysqld_safe',
        '--user=mysql',
        "--datadir='/var/lib/mysql",
      ],
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
      subcontainer: await SubContainer.of(
        effects,
        { imageId: 'backend' },
        backendMounts,
        'backend-api',
      ),
      command: [
        '/backend/wait-for-it.sh',
        `localhost:${dbPort}`,
        '--timeout=720',
        '--strict',
        '-- ./start.sh',
      ],
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
      subcontainer: await SubContainer.of(
        effects,
        { imageId: 'backend' },
        sdk.Mounts.of().addVolume('frontend', null, '/root', false),
        'user-interface',
      ),
      command: ['nginx', '-g', "'daemon off;'"],
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
