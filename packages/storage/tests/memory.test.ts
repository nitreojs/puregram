import { describe, expect, it } from 'vitest'

import { MemoryStorage } from '../src/memory'

describe('MemoryStorage', () => {
  it('returns undefined for missing keys', async () => {
    const s = new MemoryStorage<number>()

    expect(await s.get('nope')).toBeUndefined()
    expect(await s.has('nope')).toBe(false)
  })

  it('round-trips primitive and object values', async () => {
    const s = new MemoryStorage<unknown>()

    await s.set('n', 42)
    await s.set('o', { a: 1, b: [2, 3] })

    expect(await s.get('n')).toBe(42)
    expect(await s.get('o')).toEqual({ a: 1, b: [2, 3] })
  })

  it('treats explicit undefined as a present key', async () => {
    const s = new MemoryStorage<number | undefined>()

    await s.set('k', undefined)

    expect(await s.has('k')).toBe(true)
    expect(await s.get('k')).toBeUndefined()
  })

  it('delete removes the entry; subsequent get/has reflect that', async () => {
    const s = new MemoryStorage<string>()

    await s.set('k', 'v')
    expect(await s.has('k')).toBe(true)

    await s.delete('k')
    expect(await s.has('k')).toBe(false)
    expect(await s.get('k')).toBeUndefined()
  })

  it('delete on a missing key is a no-op', async () => {
    const s = new MemoryStorage<string>()

    await expect(s.delete('ghost')).resolves.toBeUndefined()
  })

  it('seeds from a constructor entries iterable', async () => {
    const s = new MemoryStorage<number>([['a', 1], ['b', 2]])

    expect(await s.get('a')).toBe(1)
    expect(await s.get('b')).toBe(2)
    expect(s.size).toBe(2)
  })

  it('iterates keys/values/entries in insertion order', async () => {
    const s = new MemoryStorage<number>()

    await s.set('x', 1)
    await s.set('y', 2)
    await s.set('z', 3)

    const keys: string[] = []

    for await (const k of s.keys()) {
      keys.push(k)
    }

    expect(keys).toEqual(['x', 'y', 'z'])

    const values: number[] = []

    for await (const v of s.values()) {
      values.push(v)
    }

    expect(values).toEqual([1, 2, 3])

    const pairs: [string, number][] = []

    for await (const [k, v] of s.entries()) {
      pairs.push([k, v])
    }

    expect(pairs).toEqual([['x', 1], ['y', 2], ['z', 3]])
  })

  it('iterates empty when the storage is empty', async () => {
    const s = new MemoryStorage<number>()

    const collected: string[] = []

    for await (const k of s.keys()) {
      collected.push(k)
    }

    expect(collected).toEqual([])
  })
})
