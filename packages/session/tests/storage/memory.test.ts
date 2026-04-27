import { describe, expect, it } from 'vitest'

import { MemoryStorage, type MemoryStoreLike } from '../../src/storage/memory'

describe('MemoryStorage', () => {
  it('returns undefined for unknown key', async () => {
    const s = new MemoryStorage()

    expect(await s.get('missing')).toBeUndefined()
  })

  it('set/get round-trip', async () => {
    const s = new MemoryStorage()

    await s.set('k', { a: 1 })

    expect(await s.get('k')).toEqual({ a: 1 })
  })

  it('set returns true', async () => {
    const s = new MemoryStorage()

    expect(await s.set('k', 1)).toBe(true)
  })

  it('has reflects presence', async () => {
    const s = new MemoryStorage()

    expect(await s.has('k')).toBe(false)

    await s.set('k', 1)

    expect(await s.has('k')).toBe(true)
  })

  it('delete removes the key and returns true on success', async () => {
    const s = new MemoryStorage()

    await s.set('k', 1)

    expect(await s.delete('k')).toBe(true)
    expect(await s.has('k')).toBe(false)
  })

  it('delete returns false when key absent', async () => {
    const s = new MemoryStorage()

    expect(await s.delete('missing')).toBe(false)
  })

  it('touch resolves without error and is a no-op for the in-memory case', async () => {
    const s = new MemoryStorage()

    await s.set('k', 1)

    await expect(s.touch('k')).resolves.toBeUndefined()

    expect(await s.get('k')).toBe(1)
  })

  it('accepts an injected MemoryStoreLike', async () => {
    const calls: string[] = []

    const fakeStore: MemoryStoreLike<string, unknown> = {
      get: (k) => {
        calls.push(`get:${k}`)

        return undefined
      },
      set (k, _v) {
        calls.push(`set:${k}`)

        return this
      },
      has: (k) => {
        calls.push(`has:${k}`)

        return false
      },
      delete: (k) => {
        calls.push(`del:${k}`)

        return false
      }
    }

    const s = new MemoryStorage({ store: fakeStore })

    await s.get('k')
    await s.set('k', 1)
    await s.has('k')
    await s.delete('k')

    expect(calls).toEqual(['get:k', 'set:k', 'has:k', 'del:k'])
  })
})
