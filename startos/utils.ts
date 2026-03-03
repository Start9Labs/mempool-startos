import { T, utils } from '@start9labs/start-sdk'
import { i18n } from './i18n'

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
export const btcCookiePath = `${btcMountpoint}/.cookie`

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
      name: i18n('Transaction Indexer'),
      result: 'loading',
      message: i18n(
        'Initial blockchain download still in progress. Mempool will not display correctly until this is complete.',
      ),
    }
  } else if (!txIndexRes.result.txindex.synced) {
    return {
      name: i18n('Transaction Indexer'),
      result: 'loading',
      message: i18n(
        'Transaction Indexer is still syncing. Mempool will not display correctly until sync is complete.',
      ),
    }
  } else if (txIndexRes.result.txindex.synced) {
    return {
      name: i18n('Transaction Indexer'),
      result: 'success',
      message: i18n('Fully synced.'),
    }
  } else {
    return {
      name: i18n('Transaction Indexer'),
      result: 'starting',
      message: i18n('Mempool is starting'),
    }
  }
}
