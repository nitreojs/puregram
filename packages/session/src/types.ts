import { Context } from 'puregram'

import { SessionStorage } from './storages'

export type Middleware<T> = (context: T, next: Function) => unknown

export type SessionForceUpdate = () => Promise<boolean>

export interface ContextInterface extends Context {
  [key: string]: any
}

export interface SessionContext {
  $forceUpdate(): Promise<boolean>

  [key: string]: any
}

export interface SessionInterface {
  session: SessionContext
}

export interface SessionManagerOptions<T = {}> {
  /** Storage based on SessionStorage interface */
  storage: SessionStorage

  /** Returns the key for session storage */
  getStorageKey(context: ContextInterface & T): string
}
