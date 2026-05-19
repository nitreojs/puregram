import type { TtlStorage } from '@puregram/storage'

/** structural slice of better-sqlite3's `Statement` we depend on */
export interface SqliteLikeStatement {
  run: (...params: unknown[]) => { changes: number }
  get: (...params: unknown[]) => unknown
  all: (...params: unknown[]) => unknown[]
}

/** structural slice of better-sqlite3's `Database` we depend on */
export interface SqliteLikeDatabase {
  exec: (sql: string) => void
  prepare: (sql: string) => SqliteLikeStatement
}

/** options accepted by {@link SqliteStorage} */
export interface SqliteStorageOptions {
  /** better-sqlite3 (or compatible) database handle */
  db: SqliteLikeDatabase
  /** table name. default `puregram_kv`. created via `CREATE TABLE IF NOT EXISTS` on construction */
  table?: string
  /**
   * default ttl applied on every {@link SqliteStorage.set}, in milliseconds.
   * stored as a `expires_at` column. `get` lazily evicts expired rows
   */
  ttlMs?: number
  /**
   * background sweep interval in milliseconds. when set, periodically deletes
   * expired rows. omit to skip — `get` still does per-row lazy eviction
   */
  sweepIntervalMs?: number
}

interface Row {
  value: string
  expires_at: number | null
}

/**
 * sqlite-backed {@link TtlStorage}. values are JSON-serialised. native ttl
 * lives in an `expires_at` integer column (unix ms) — `get` evicts expired
 * rows lazily; an optional sweep timer batches eviction
 */
export class SqliteStorage<V = unknown> implements TtlStorage<V> {
  private readonly db: SqliteLikeDatabase
  private readonly table: string
  private readonly ttlMs: number | undefined
  private readonly stmtGet: SqliteLikeStatement
  private readonly stmtSet: SqliteLikeStatement
  private readonly stmtDelete: SqliteLikeStatement
  private readonly stmtHas: SqliteLikeStatement
  private readonly stmtTouch: SqliteLikeStatement
  private readonly stmtSweep: SqliteLikeStatement
  private readonly stmtKeys: SqliteLikeStatement
  private readonly sweepTimer: ReturnType<typeof setInterval> | undefined

  constructor (options: SqliteStorageOptions) {
    this.db = options.db
    this.table = options.table ?? 'puregram_kv'
    this.ttlMs = options.ttlMs

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.table} (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        expires_at INTEGER
      )
    `)

    this.stmtGet = this.db.prepare(`SELECT value, expires_at FROM ${this.table} WHERE key = ?`)
    this.stmtSet = this.db.prepare(
      `INSERT INTO ${this.table} (key, value, expires_at) VALUES (?, ?, ?) ` +
      'ON CONFLICT(key) DO UPDATE SET value = excluded.value, expires_at = excluded.expires_at'
    )
    this.stmtDelete = this.db.prepare(`DELETE FROM ${this.table} WHERE key = ?`)
    this.stmtHas = this.db.prepare(`SELECT 1 FROM ${this.table} WHERE key = ?`)
    this.stmtTouch = this.db.prepare(`UPDATE ${this.table} SET expires_at = ? WHERE key = ?`)
    this.stmtSweep = this.db.prepare(`DELETE FROM ${this.table} WHERE expires_at IS NOT NULL AND expires_at < ?`)
    this.stmtKeys = this.db.prepare(`SELECT key FROM ${this.table}`)

    if (options.sweepIntervalMs !== undefined && options.sweepIntervalMs > 0) {
      this.sweepTimer = setInterval(() => this.sweep(), options.sweepIntervalMs)

      const timer = this.sweepTimer as { unref?: () => void }

      if (typeof timer.unref === 'function') {
        timer.unref()
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- KVStorage contract is async
  async get (key: string): Promise<V | undefined> {
    const row = this.stmtGet.get(key) as Row | undefined

    if (row === undefined) {
      return undefined
    }

    if (row.expires_at !== null && Date.now() > row.expires_at) {
      this.stmtDelete.run(key)

      return undefined
    }

    return JSON.parse(row.value) as V
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- KVStorage contract is async
  async set (key: string, value: V) {
    const expiresAt = this.ttlMs !== undefined ? Date.now() + this.ttlMs : null

    this.stmtSet.run(key, JSON.stringify(value), expiresAt)
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- KVStorage contract is async
  async delete (key: string) {
    this.stmtDelete.run(key)
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- KVStorage contract is async
  async has (key: string) {
    return this.stmtHas.get(key) !== undefined
  }

  /** roll the configured ttl forward without rewriting the value */
  // eslint-disable-next-line @typescript-eslint/require-await -- KVStorage contract is async
  async touch (key: string) {
    if (this.ttlMs === undefined) {
      return
    }

    this.stmtTouch.run(Date.now() + this.ttlMs, key)
  }

  /** delete every row whose `expires_at` has elapsed. invoked automatically when `sweepIntervalMs` is set */
  sweep () {
    return this.stmtSweep.run(Date.now()).changes
  }

  /** stop the background sweep timer, if one was started */
  close () {
    if (this.sweepTimer !== undefined) {
      clearInterval(this.sweepTimer)
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- KVStorage iterators are async by contract
  async * keys () {
    const rows = this.stmtKeys.all() as { key: string }[]

    for (const row of rows) {
      yield row.key
    }
  }
}
