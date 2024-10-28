import { sdk } from './sdk'
import { exposedStore } from './store'
import { setDependencies } from '././dependencies'
import { setInterfaces } from './interfaces'
import { versions } from './versions'
import { actions } from './actions'

// **** Install ****
const install = sdk.setupInstall(async ({ effects }) => {
  // @TODO copy mempool-config-sample.json to mempool-config.json
  // setup db?
})

// **** Uninstall ****
const uninstall = sdk.setupUninstall(async ({ effects }) => {})

/**
 * Plumbing. DO NOT EDIT.
 */
export const { packageInit, packageUninit, containerInit } = sdk.setupInit(
  versions,
  install,
  uninstall,
  setInterfaces,
  setDependencies,
  actions,
  exposedStore,
)
