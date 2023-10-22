import { Context } from 'puregram'

export type Middleware<T> = (context: T, next: Function) => unknown

export interface ContextInterface extends Context {
  [key: string]: any
}

export type SessionContext<S = {}> = S & {
  $forceUpdate(): Promise<boolean>

  [key: string]: any
}

export interface SessionLayer<S = unknown> {
  session: SessionContext<S>
}

// extending contexts! :3 :3333 >_<
declare module 'puregram' {
  interface Context {
    session: SessionContext
  }
}
