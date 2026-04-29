import { describe, expect, it } from 'vitest'

import { CacheRepository } from '../src/repository'

describe('CacheRepository', () => {
  it('starts empty', () => {
    const r = new CacheRepository<string, number>()
    expect(r.has('a')).toBe(false)
    expect(r.get('a')).toBeUndefined()
    expect(r.keys).toEqual([])
    expect(r.values).toEqual([])
  })

  it('set/get round-trips', () => {
    const r = new CacheRepository<string, number>()
    r.set('a', 1)
    expect(r.get('a')).toBe(1)
    expect(r.has('a')).toBe(true)
  })

  it('keys/values stay in sync after mutation', () => {
    const r = new CacheRepository<string, number>()
    r.set('a', 1)
    r.set('b', 2)
    expect(r.keys).toEqual(['a', 'b'])
    expect(r.values).toEqual([1, 2])
  })

  it('delete drops the key and resyncs', () => {
    const r = new CacheRepository<string, number>()
    r.set('a', 1)
    r.set('b', 2)
    expect(r.delete('a')).toBe(true)
    expect(r.has('a')).toBe(false)
    expect(r.keys).toEqual(['b'])
    expect(r.values).toEqual([2])
  })

  it('delete returns false on missing key', () => {
    const r = new CacheRepository<string, number>()
    expect(r.delete('missing')).toBe(false)
  })

  it('strictSet throws on duplicate key', () => {
    const r = new CacheRepository<string, number>()
    r.strictSet('a', 1)
    expect(() => r.strictSet('a', 2)).toThrow(/already exists/)
  })

  it('strictGet throws on missing key', () => {
    const r = new CacheRepository<string, number>()
    expect(() => r.strictGet('missing')).toThrow(/not found/)
  })

  it('iterates as [key, value] pairs', () => {
    const r = new CacheRepository<string, number>()
    r.set('a', 1)
    r.set('b', 2)
    const collected = [...r]
    expect(collected).toEqual([['a', 1], ['b', 2]])
  })

  it('honors sortingValues comparator', () => {
    const r = new CacheRepository<string, number>({ sortingValues: (a, b) => b - a })
    r.set('a', 1)
    r.set('b', 5)
    r.set('c', 3)
    expect(r.values).toEqual([5, 3, 1])
  })
})
