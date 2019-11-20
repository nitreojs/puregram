import { MessageContext } from '../../puregram';

import { SceneContext } from './contexts';

export type Middleware<T> = (context: T, next: Function) => any;

export interface ISessionContext {
	[key: string]: any;
}

export interface IContext extends Context {
	/**
	 * Scene control context
	 */
	scene: SceneContext;

	[key: string]: any;
}
