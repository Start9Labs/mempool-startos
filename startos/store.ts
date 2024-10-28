import { setupExposeStore } from '@start9labs/start-sdk'

export type Store = {
  lightning: 'lnd' | 'cln' | 'none'
  electrs: boolean
}

export const exposedStore = setupExposeStore<Store>((pathBuilder) => [])
