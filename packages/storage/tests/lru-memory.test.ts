import { describe, expect, it } from 'vitest'

import { LruMemoryStorage } from '../src/lru-memory'

async function collectKeys (s: LruMemoryStorage<unknown>) {
  const out: string[] = []

  for await (const k of s.keys()) {
    out.push(k)
  }

  return out
}

describe('LruMemoryStorage', () => {
  it('throws RangeError for non-positive max', () => {
    expect(() => new LruMemoryStorage({ max: 0 })).toThrow(RangeError)
    expect(() => new LruMemoryStorage({ max: -1 })).toThrow(RangeError)
    expect(() => new LruMemoryStorage({ max: Number.NaN })).toThrow(RangeError)
    expect(() => new LruMemoryStorage({ max: Number.POSITIVE_INFINITY })).toThrow(RangeError)
  })

  it('behaves like MemoryStorage under capacity', async () => {
    const s = new LruMemoryStorage<number>({ max: 5 })

    await s.set('a', 1)
    await s.set('b', 2)

    expect(await s.get('a')).toBe(1)
    expect(await s.has('b')).toBe(true)
    expect(s.size).toBe(2)
  })

  it('evicts the oldest entry when set exceeds capacity', async () => {
    const s = new LruMemoryStorage<number>({ max: 2 })

    await s.set('a', 1)
    await s.set('b', 2)
    await s.set('c', 3)

    expect(await s.has('a')).toBe(false)
    expect(await s.get('b')).toBe(2)
    expect(await s.get('c')).toBe(3)
    expect(s.size).toBe(2)
  })

  it('get bumps recency: previously oldest survives the next eviction', async () => {
    const s = new LruMemoryStorage<number>({ max: 2 })

    await s.set('a', 1)
    await s.set('b', 2)

    // touch a — now b is the oldest
    await s.get('a')
    await s.set('c', 3)

    expect(await s.has('b')).toBe(false)
    expect(await s.has('a')).toBe(true)
    expect(await s.has('c')).toBe(true)
  })

  it('set on an existing key bumps recency', async () => {
    const s = new LruMemoryStorage<number>({ max: 2 })

    await s.set('a', 1)
    await s.set('b', 2)
    await s.set('a', 11) // re-set bumps a to most-recent

    await s.set('c', 3)

    expect(await s.has('b')).toBe(false)
    expect(await s.get('a')).toBe(11)
    expect(await s.has('c')).toBe(true)
  })

  it('has does not bump recency', async () => {
    const s = new LruMemoryStorage<number>({ max: 2 })

    await s.set('a', 1)
    await s.set('b', 2)

    // has on a should NOT save it from eviction
    await s.has('a')
    await s.set('c', 3)

    expect(await s.has('a')).toBe(false)
    expect(await s.has('b')).toBe(true)
    expect(await s.has('c')).toBe(true)
  })

  it('delete on a missing key is a no-op', async () => {
    const s = new LruMemoryStorage<number>({ max: 2 })

    await expect(s.delete('ghost')).resolves.toBeUndefined()
  })

  it('iterates oldest → newest', async () => {
    const s = new LruMemoryStorage<number>({ max: 5 })

    await s.set('a', 1)
    await s.set('b', 2)
    await s.set('c', 3)

    expect(await collectKeys(s)).toEqual(['a', 'b', 'c'])

    // bump b — iteration order should now be a, c, b
    await s.get('b')

    expect(await collectKeys(s)).toEqual(['a', 'c', 'b'])
  })
})
