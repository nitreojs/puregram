import { describe, expect, it, vi } from 'vitest'

import type { RedisLikeClient } from '../src/storage'
import { RedisStorage } from '../src/storage'

const makeMock = () => {
  const store = new Map<string, { v: string, exp?: number }>()

  const client: RedisLikeClient = {
    get: vi.fn((key: string) => {
      const entry = store.get(key)

      if (entry === undefined) {
        return Promise.resolve(null)
      }

      if (entry.exp !== undefined && Date.now() > entry.exp) {
        store.delete(key)

        return Promise.resolve(null)
      }

      return Promise.resolve(entry.v)
    }),
    set: vi.fn((key: string, value: string, mode?: 'PX', ms?: number) => {
      const entry: { v: string, exp?: number } = { v: value }

      if (mode === 'PX' && ms !== undefined) {
        entry.exp = Date.now() + ms
      }

      store.set(key, entry)

      return Promise.resolve('OK')
    }) as unknown as RedisLikeClient['set'],
    del: vi.fn((key: string) => {
      const had = store.delete(key)

      return Promise.resolve(had ? 1 : 0)
    }),
    exists: vi.fn((key: string) => Promise.resolve(store.has(key) ? 1 : 0)),
    expire: vi.fn((key: string, seconds: number) => {
      const entry = store.get(key)

      if (entry === undefined) {
        return Promise.resolve(0)
      }

      entry.exp = Date.now() + seconds * 1_000

      return Promise.resolve(1)
    }),
    pexpire: vi.fn((key: string, ms: number) => {
      const entry = store.get(key)

      if (entry === undefined) {
        return Promise.resolve(0)
      }

      entry.exp = Date.now() + ms

      return Promise.resolve(1)
    }),
    keys: vi.fn((pattern: string) => {
      const prefix = pattern.endsWith('*') ? pattern.slice(0, -1) : pattern

      return Promise.resolve([...store.keys()].filter(k => k.startsWith(prefix)))
    })
  }

  return { client, store }
}

describe('RedisStorage', () => {
  it('round-trips primitive and object values through JSON', async () => {
    const { client } = makeMock()
    const s = new RedisStorage<{ counter: number }>({ client })

    await s.set('k', { counter: 1 })

    expect(await s.get('k')).toEqual({ counter: 1 })
  })

  it('namespaces keys with the configured prefix', async () => {
    const { client, store } = makeMock()
    const s = new RedisStorage({ client, prefix: 'sess:' })

    await s.set('user:1', 'hello')

    expect(store.has('sess:user:1')).toBe(true)
    expect(client.get).not.toHaveBeenCalledWith('user:1')
  })

  it('returns undefined for missing keys', async () => {
    const { client } = makeMock()
    const s = new RedisStorage({ client })

    expect(await s.get('nope')).toBeUndefined()
  })

  it('applies ttl via PX when ttlMs is configured', async () => {
    const { client } = makeMock()
    const s = new RedisStorage({ client, ttlMs: 5_000 })

    await s.set('k', 'v')

    expect(client.set).toHaveBeenCalledWith('puregram:k', JSON.stringify('v'), 'PX', 5_000)
  })

  it('omits PX when no ttlMs is configured', async () => {
    const { client } = makeMock()
    const s = new RedisStorage({ client })

    await s.set('k', 'v')

    expect(client.set).toHaveBeenCalledWith('puregram:k', JSON.stringify('v'))
  })

  it('touch rolls the ttl forward via pexpire', async () => {
    const { client } = makeMock()
    const s = new RedisStorage({ client, ttlMs: 5_000 })

    await s.set('k', 'v')
    await s.touch('k')

    expect(client.pexpire).toHaveBeenCalledWith('puregram:k', 5_000)
  })

  it('touch is a no-op without a configured ttl', async () => {
    const { client } = makeMock()
    const s = new RedisStorage({ client })

    await s.touch('k')

    expect(client.pexpire).not.toHaveBeenCalled()
  })

  it('delete and has forward to del / exists', async () => {
    const { client } = makeMock()
    const s = new RedisStorage({ client })

    await s.set('k', 'v')

    expect(await s.has('k')).toBe(true)

    await s.delete('k')

    expect(await s.has('k')).toBe(false)
  })

  it('keys iterator strips the prefix and walks KEYS pattern', async () => {
    const { client } = makeMock()
    const s = new RedisStorage({ client, prefix: 'pg:' })

    await s.set('a', 1)
    await s.set('b', 2)

    const seen: string[] = []

    for await (const k of s.keys?.() ?? []) {
      seen.push(k)
    }

    expect(seen.sort()).toEqual(['a', 'b'])
    expect(client.keys).toHaveBeenCalledWith('pg:*')
  })
})
