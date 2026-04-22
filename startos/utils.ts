import { utils } from '@start9labs/start-sdk'

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
