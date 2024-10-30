import { sdk } from './sdk'
import { exposedStore } from './store'
import { setDependencies } from '././dependencies'
import { setInterfaces } from './interfaces'
import { versions } from './versions'
import { actions } from './actions'

// **** Install ****
const install = sdk.setupInstall(async ({ effects }) => {
  // initalize mempool-config.json with defaults
  await sdk.runCommand(
    effects,
    { id: 'backend' },
    [
      'sed',
      '-i',
      "'s/node /backend/package/index.js/#node /backend/package/index.js/'",
      'start.sh',
    ],
    {},
    'alterStartScript',
  )
  await sdk.runCommand(
    effects,
    { id: 'backend' },
    './start.sh',
    {},
    'initConfig',
  )
  await sdk.runCommand(
    effects,
    { id: 'backend' },
    [
      'sed',
      '-i',
      "'s/#node /backend/package/index.js/node /backend/package/index.js/'",
      'start.sh',
    ],
    {},
    'revertStartScript',
  )
  // setup nginx
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
