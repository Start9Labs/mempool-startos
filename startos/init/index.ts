import { sdk } from '../sdk'
import { seedFiles } from './seedFiles'
import { taskSelectIndexer } from './taskSelectIndexer'
import { watchHosts } from './watchHosts'
import { watchTorProxy } from './watchTorProxy'
import { dependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedFiles,
  setInterfaces,
  actions,
  dependencies,
  taskSelectIndexer,
  watchHosts,
  watchTorProxy,
)

export const uninit = sdk.setupUninit(versionGraph)
