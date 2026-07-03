import { sdk } from '../sdk'
import { seedFiles } from './seedFiles'
import { taskSelectIndexer } from './taskSelectIndexer'
import { watchHosts } from './watchHosts'
import { setDependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedFiles,
  setInterfaces,
  setDependencies,
  actions,
  taskSelectIndexer,
  watchHosts,
)

export const uninit = sdk.setupUninit(versionGraph)
