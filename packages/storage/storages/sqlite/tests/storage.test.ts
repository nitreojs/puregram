import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { SqliteLikeDatabase } from '../src/storage'
import { SqliteStorage } from '../src/storage'

// in-memory mock that mimics enough of better-sqlite3 to exercise the adapter
const makeMock = () => {
  const table = new Map<string, { value: string, expires_at: number | null }>()

  const exec = vi.fn((_sql: string) => undefined)

  const prepare = (sql: string) => {
    const normalized = sql.toLowerCase()

    if (normalized.startsWith('select value')) {
      return {
        run: () => ({ changes: 0 }),
        get: (key: string) => {
          const row = table.get(key)

          return row === undefined ? undefined : { ...row }
        },
        all: () => []
      }
    }

    if (normalized.startsWith('insert')) {
      return {
        run: (key: string, value: string, expiresAt: number | null) => {
          table.set(key, { value, expires_at: expiresAt })

          return { changes: 1 }
        },
        get: () => undefined,
        all: () => []
      }
    }

    if (normalized.startsWith('delete from') && normalized.includes('where key')) {
      return {
        run: (key: string) => {
          const had = table.delete(key)

          return { changes: had ? 1 : 0 }
        },
        get: () => undefined,
        all: () => []
      }
    }

    if (normalized.startsWith('select 1')) {
      return {
        run: () => ({ changes: 0 }),
        get: (key: string) => (table.has(key) ? { 1: 1 } : undefined),
        all: () => []
      }
    }

    if (normalized.startsWith('update')) {
      return {
        run: (expiresAt: number, key: string) => {
          const row = table.get(key)

          if (row !== undefined) {
            row.expires_at = expiresAt
          }

          return { changes: row !== undefined ? 1 : 0 }
        },
        get: () => undefined,
        all: () => []
      }
    }

    if (normalized.includes('expires_at is not null')) {
      return {
        run: (now: number) => {
          let n = 0

          for (const [k, row] of table.entries()) {
            if (row.expires_at !== null && row.expires_at < now) {
              table.delete(k)
              n += 1
            }
          }

          return { changes: n }
        },
        get: () => undefined,
        all: () => []
      }
    }

    if (normalized.startsWith('select key')) {
      return {
        run: () => ({ changes: 0 }),
        get: () => undefined,
        all: () => [...table.keys()].map(key => ({ key }))
      }
    }

    return {
      run: () => ({ changes: 0 }),
      get: () => undefined,
      all: () => []
    }
  }

  const db: SqliteLikeDatabase = { exec, prepare }

  return { db, table }
}

describe('SqliteStorage', () => {
  it('creates the table on construction', () => {
    const { db } = makeMock()

    const _s = new SqliteStorage({ db, table: 'sessions' })

    expect(db.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS sessions'))
  })

  it('round-trips primitive and object values through JSON', async () => {
    const { db } = makeMock()
    const s = new SqliteStorage<{ counter: number }>({ db })

    await s.set('k', { counter: 7 })

    expect(await s.get('k')).toEqual({ counter: 7 })
  })

  it('returns undefined for missing keys', async () => {
    const { db } = makeMock()
    const s = new SqliteStorage({ db })

    expect(await s.get('nope')).toBeUndefined()
  })

  it('delete removes the entry', async () => {
    const { db } = makeMock()
    const s = new SqliteStorage({ db })

    await s.set('k', 'v')

    expect(await s.has('k')).toBe(true)

    await s.delete('k')

    expect(await s.has('k')).toBe(false)
  })

  describe('ttl', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('stamps expires_at on set when ttlMs is configured', async () => {
      const { db, table } = makeMock()
      const s = new SqliteStorage({ db, ttlMs: 5_000 })

      const start = Date.now()

      await s.set('k', 'v')

      expect(table.get('k')?.expires_at).toBe(start + 5_000)
    })

    it('evicts expired rows on read', async () => {
      const { db, table } = makeMock()
      const s = new SqliteStorage({ db, ttlMs: 1_000 })

      await s.set('k', 'v')
      vi.advanceTimersByTime(2_000)

      expect(await s.get('k')).toBeUndefined()
      expect(table.has('k')).toBe(false)
    })

    it('touch rolls expires_at forward', async () => {
      const { db, table } = makeMock()
      const s = new SqliteStorage({ db, ttlMs: 1_000 })

      await s.set('k', 'v')

      const initial = table.get('k')?.expires_at ?? 0

      vi.advanceTimersByTime(500)
      await s.touch('k')

      expect(table.get('k')?.expires_at ?? 0).toBeGreaterThan(initial)
    })

    it('sweep deletes every expired row in one shot', async () => {
      const { db, table } = makeMock()
      const s = new SqliteStorage({ db, ttlMs: 1_000 })

      await s.set('a', 1)
      await s.set('b', 2)

      vi.advanceTimersByTime(2_000)

      const removed = s.sweep()

      expect(removed).toBe(2)
      expect(table.size).toBe(0)
    })
  })

  it('keys iterator yields every stored key', async () => {
    const { db } = makeMock()
    const s = new SqliteStorage({ db })

    await s.set('a', 1)
    await s.set('b', 2)

    const seen: string[] = []

    for await (const k of s.keys?.() ?? []) {
      seen.push(k)
    }

    expect(seen.sort()).toEqual(['a', 'b'])
  })
})
