import { Context } from 'puregram';

import { SceneContext } from './contexts';

export type Middleware<T> = (context: T, next: Function) => unknown;

export interface SessionContext {
  [key: string]: any;
}

export interface ContextInterface extends Context {
  scene: SceneContext;

  [key: string]: any;
}
