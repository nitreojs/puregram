import { ISessionStorage, MemoryStorage } from './storages';

import { IContext, ISessionContext, Middleware } from './types';

export interface ISessionManagerOptions<T = {}> {
	/**
	 * Storage based on ISessionStorage interface
	 */
	storage: ISessionStorage;

	/**
	 * Key for session in context
	 */
	contextKey: string;

	/**
	 * Returns the key for session storage
	 */
	getStorageKey(context: IContext & T): string;
}

export type SessionForceUpdate = () => Promise<boolean>;

export default class SessionManager<T = {}> {
	protected storage: ISessionManagerOptions['storage'];

	protected contextKey: ISessionManagerOptions['contextKey'];

	protected getStorageKey: ISessionManagerOptions['getStorageKey'];

	public constructor(options?: Partial<ISessionManagerOptions<T>>);

	/**
	 * Returns the middleware for embedding
	 */
	public get middleware(): Middleware<IContext>;
}