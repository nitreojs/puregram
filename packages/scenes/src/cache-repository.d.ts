type CacheRepositorySortingValues<Value> = (a: Value, b: Value) => number;

declare class CacheRepository<Key, Value> {
  private readonly collection: Map<Key, Value> = new Map();

	public keys: Key[] = [];

	public values: Value[] = [];

	protected sortingValues?: CacheRepositorySortingValues<Value>;

  constructor({ sortingValues }: {
    sortingValues?: CacheRepositorySortingValues<Value>;
  });

  /**
   * Checks has value by key
   */
  public has(key: Key): boolean;
  
  /**
   * Sets value by key
   */
  public set(key: Key, value: Value): void;

  /**
   * Returns value by key
   */
  public get(key: Key): Value | null;

  /**
   * Sets value by key else error if exits
   */
  public strictSet(key: Key, value: Value): void;

  /**
   * Returns value by key else error
   */
  public strictGet(key: Key): Value;

  /**
   * Returns iterator
   */
  public [Symbol.iterator](): IterableIterator<[Key, Value]>;
}

export = CacheRepository;
