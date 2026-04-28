import { describe, expect, it } from 'vitest'

import { isTtlStorage, type KVStorage, type TtlStorage } from '../src/kv-storage'
import { LruMemoryStorage } from '../src/lru-memory'
import { MemoryStorage } from '../src/memory'

describe('isTtlStorage', () => {
  it('returns false for MemoryStorage', () => {
    expect(isTtlStorage(new MemoryStorage())).toBe(false)
  })

  it('returns false for LruMemoryStorage', () => {
    expect(isTtlStorage(new LruMemoryStorage({ max: 1 }))).toBe(false)
  })

  it('returns true and narrows the type for a TtlStorage implementation', async () => {
    const touched: string[] = []

    class FakeTtl<V = unknown> extends MemoryStorage<V> implements TtlStorage<V> {
      touch (key: string) {
        touched.push(key)

        return Promise.resolve()
      }
    }

    const storage: KVStorage<number> = new FakeTtl<number>()

    expect(isTtlStorage(storage)).toBe(true)

    if (isTtlStorage(storage)) {
      // narrowed to TtlStorage<number> — touch is callable
      await storage.touch('k')
    }

    expect(touched).toEqual(['k'])
  })
})
