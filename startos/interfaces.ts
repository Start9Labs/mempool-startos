import { sdk } from './sdk'
import { uiPort } from './utils'
import { i18n } from './i18n'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const uiMulti = sdk.MultiHost.of(effects, 'main')
  const uiMultiOrigin = await uiMulti.bindPort(uiPort, { protocol: 'http' })
  const ui = sdk.createInterface(effects, {
    name: i18n('Web UI'),
    id: 'webui',
    description: i18n('The web interface of Mempool'),
    type: 'ui',
    schemeOverride: null,
    masked: false,
    username: null,
    path: '',
    query: {},
  })

  const multiReceipt = await uiMultiOrigin.export([ui])

  return [multiReceipt]
})
