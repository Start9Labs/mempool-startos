import { setupExposeStore } from '@start9labs/start-sdk'

export type Store = {}

export const InitStore = {}

export const exposedStore = setupExposeStore<Store>((pathBuilder) => [])
