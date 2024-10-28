import { jsonFile } from '../../file-models/mempool-config.json'
import { backendMounts } from '../../main'
import { sdk } from '../../sdk'
import { inputSpec } from './spec'

export const config = sdk.Action.withInput(
  'config',

  async ({ effects }) => ({
    name: 'Configure',
    description: 'Customize and enable options',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // optionally pre-fill the input form
  async ({ effects }) => {
    // @TODO correct for pre-filling with entire store?
    await sdk.store.getOwn(effects, sdk.StorePath)
  },

  // the execution function
  async ({ effects, input }) => {
    const currentLightning = await sdk.store
      .getOwn(effects, sdk.StorePath.lightning)
      .const()

    const electrsEnabled = await sdk.store
      .getOwn(effects, sdk.StorePath.electrs)
      .const()

    if (
      currentLightning === input.lightning &&
      electrsEnabled === input.electrs
    )
      return

    const configFile = (await jsonFile.read.const(effects))!

    if (input.lightning === 'lnd') {
      // @TODO mainMounts.addDependency<typeof LndManifest>
      const mountpoint = '/mnt/lnd'
      backendMounts.addDependency(
        'lnd',
        'main', //@TODO verify
        'public', //@TODO verify
        mountpoint,
        true,
      )
      configFile.LIGHTNING.ENABLED = true
      configFile.LIGHTNING.BACKEND = 'lnd'
      configFile.LND.MACAROON_PATH = `${mountpoint}/readonly.macaroon`
      configFile.LND.TLS_CERT_PATH = `${mountpoint}/tls.cert`
      configFile.LND.TLS_CERT_PATH = 'https://lnd.embassy:8080' // @TODO confirm new
    }

    if (input.lightning === 'cln') {
      // @TODO mainMounts.addDependency<typeof ClnManifest>
      const mountpoint = '/mnt/cln'
      backendMounts.addDependency(
        'cln',
        'main', //@TODO verify
        'shared', //@TODO verify
        mountpoint,
        true,
      )
      configFile.LIGHTNING.ENABLED = true
      configFile.LIGHTNING.BACKEND = 'cln'
      configFile.CLIGHTNING.SOCKET = `${mountpoint}/lightning-rpc`
    }

    if (input.electrs) {
      configFile.ELECTRUM.HOST = 'electrs.embassy' // @TODO confirm new
      configFile.ELECTRUM.PORT = 50001 // @TODO confirm new
    }

    await Promise.all([
      jsonFile.merge(configFile), // @TODO needed?
      sdk.store.setOwn(effects, sdk.StorePath.lightning, input.lightning),
      sdk.store.setOwn(effects, sdk.StorePath.electrs, input.electrs),
    ])
  },
)
