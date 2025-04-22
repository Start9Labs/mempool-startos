import { sdk } from './sdk'
import { exposedStore, InitStore } from './store'
import { setDependencies } from '././dependencies'
import { setInterfaces } from './interfaces'
import { versions } from './versions'
import { actions } from './actions'

// **** PreInstall ****
const preInstall = sdk.setupPreInstall(async ({ effects }) => {})

// **** PostInstall ****
const postInstall = sdk.setupPostInstall(async ({ effects }) => {
  // initalize mempool-config.json with defaults

  await sdk.SubContainer.withTemp(
    effects,
    { imageId: 'backend' },
    sdk.Mounts.of().addVolume('backend', null, '/backend/cache', false),
    'init-config',
    async (sub) => {
      await sub.exec([
        'sed',
        '-i',
        "'s/node /backend/package/index.js/#node /backend/package/index.js/'",
        'start.sh',
      ])
      await sub.exec(['./start.sh'])
      await sub.exec([
        'sed',
        '-i',
        "'s/#node /backend/package/index.js/node /backend/package/index.js/'",
        'start.sh',
      ])
    },
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
  preInstall,
  postInstall,
  uninstall,
  setInterfaces,
  setDependencies,
  actions,
  InitStore,
  exposedStore,
)
