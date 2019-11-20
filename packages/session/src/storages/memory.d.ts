import ISessionStorage from './storage';

export interface IMemoryStoreLike<K, V> {
	get(key: K): V | undefined;
	set(key: K, value: V): this | undefined;
	delete(key: K): boolean;
}

export interface IMemoryStorageOptions {
	store: IMemoryStoreLike<string, object>;
}

export default class MemoryStorage implements ISessionStorage {
	private store: IMemoryStorageOptions['store'];

	public constructor(params?: Partial<IMemoryStorageOptions>);

	public get(key: string): Promise<object | null>;

	public set(key: string, value: object): Promise<boolean>;

	public delete(key: string): Promise<boolean>;
}