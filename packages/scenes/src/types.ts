import { Context } from 'puregram'

import { SceneContext } from './contexts'

export type Middleware<T> = (context: T, next: Function) => unknown

export interface SessionContext {
  [key: string]: any
}

export interface ContextInterface<T = {}> extends Context {
  scene: SceneContext & T

  [key: string]: any
}
