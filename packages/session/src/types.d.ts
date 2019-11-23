import { Context } from '../../puregram';

export type Middleware<T> = (context: T, next: Function) => any;

export interface IContext extends Context {
	[key: string]: any;
}

export interface ISessionContext {
	$forceUpdate(): Promise<boolean>;
	[key: string]: any;
}
