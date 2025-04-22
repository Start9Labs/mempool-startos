import { sdk } from './sdk'
import { uiPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const uiMulti = sdk.MultiHost.of(effects, 'multi')
  const uiMultiOrigin = await uiMulti.bindPort(uiPort, { protocol: 'http' })
  const ui = sdk.createInterface(effects, {
    name: 'Web UI',
    id: 'webui',
    description: 'The web interface of Mempool',
    type: 'ui',
    schemeOverride: null,
    masked: false,
    username: null,
    path: '',
    search: {},
  })

  const multiReceipt = await uiMultiOrigin.export([ui])

  return [multiReceipt]
})
