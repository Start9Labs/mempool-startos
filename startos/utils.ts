import { T } from '@start9labs/start-sdk'

export const uiPort = 8080
export const apiPort = 8999
export const dbPort = 3306

export interface TxIndexRes {
  synced: boolean
}
export interface IbdStateRes {
  initialblockdownload: boolean
}

export const determineResponse = (
  txIndexRes: TxIndexRes,
  ibdStateRes: IbdStateRes,
): T.NamedHealthCheckResult => {
  if (!ibdStateRes.initialblockdownload) {
    return {
      name: 'Transaction Indexer',
      result: 'loading',
      message:
        'Initial blockchain download still in progress. Mempool will not display correctly until this is complete.',
    }
  } else if (ibdStateRes.initialblockdownload && !txIndexRes.synced) {
    return {
      name: 'Transaction Indexer',
      result: 'loading',
      message:
        'Transaction Indexer is still syncing. Mempool will not display correctly until sync is complete.',
    }
  } else if (ibdStateRes.initialblockdownload && txIndexRes.synced) {
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
