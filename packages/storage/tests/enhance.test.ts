import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { enhanceStorage } from '../src/enhance'
import { MemoryStorage } from '../src/memory'

describe('enhanceStorage()', () => {
  it('round-trips primitive and object values through the envelope', async () => {
    const base = new MemoryStorage()
    const s = enhanceStorage<{ counter: number }>(base)

    await s.set('k', { counter: 42 })

    expect(await s.get('k')).toEqual({ counter: 42 })
    // raw shape exposes the envelope but the wrapper hides it from callers
    expect(await base.get('k')).toMatchObject({ __v: 0, data: { counter: 42 } })
  })

  it('returns undefined for missing keys', async () => {
    const s = enhanceStorage(new MemoryStorage())

    expect(await s.get('nope')).toBeUndefined()
  })

  it('chains migrations v0 -> v3 sequentially', async () => {
    const base = new MemoryStorage()

    // seed a legacy unversioned value
    await base.set('user', { name: 'a' })

    const s = enhanceStorage<{ name: string, age: number, role: string, kind: 'user' }>(base, {
      migrations: {
        1: (d: any) => ({ ...d, age: 0 }),
        2: (d: any) => ({ ...d, role: 'guest' }),
        3: (d: any) => ({ ...d, kind: 'user' as const })
      }
    })

    expect(await s.get('user')).toEqual({ name: 'a', age: 0, role: 'guest', kind: 'user' })

    // migrated envelope is written back at the latest version
    const raw = await base.get('user') as { __v: number, data: unknown }

    expect(raw.__v).toBe(3)
  })

  it('treats non-versioned data as v0 and migrates it forward', async () => {
    const base = new MemoryStorage()

    await base.set('legacy', 'raw-string')

    const s = enhanceStorage<{ value: string }>(base, {
      migrations: {
        1: (d: any) => ({ value: d as string })
      }
    })

    expect(await s.get('legacy')).toEqual({ value: 'raw-string' })
  })

  it('runs only outstanding migrations when data is already partway upgraded', async () => {
    const base = new MemoryStorage()

    // already at v1 — only v2 should fire
    await base.set('x', { __v: 1, data: { step: 1 } })

    const m1 = vi.fn((d: any) => ({ ...d, step: 1 }))
    const m2 = vi.fn((d: any) => ({ ...d, step: 2 }))

    const s = enhanceStorage(base, { migrations: { 1: m1, 2: m2 } })

    expect(await s.get('x')).toEqual({ step: 2 })
    expect(m1).not.toHaveBeenCalled()
    expect(m2).toHaveBeenCalledOnce()
  })

  describe('expiry', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns undefined and deletes the entry when __exp has elapsed', async () => {
      const base = new MemoryStorage()
      const deleteSpy = vi.spyOn(base, 'delete')

      await base.set('k', { __v: 0, __exp: Date.now() + 1_000, data: 'live' })

      const s = enhanceStorage(base)

      expect(await s.get('k')).toBe('live')

      vi.advanceTimersByTime(2_000)

      expect(await s.get('k')).toBeUndefined()
      expect(deleteSpy).toHaveBeenCalledWith('k')
    })

    it('preserves __exp across migrated writes', async () => {
      const base = new MemoryStorage()
      const exp = Date.now() + 60_000

      await base.set('k', { __v: 0, __exp: exp, data: { v: 1 } })

      const s = enhanceStorage(base, {
        migrations: { 1: (d: any) => ({ ...d, migrated: true }) }
      })

      expect(await s.get('k')).toEqual({ v: 1, migrated: true })

      const raw = await base.get('k') as { __v: number, __exp: number }

      expect(raw.__exp).toBe(exp)
    })
  })

  it('concurrent migration calls converge (last write wins)', async () => {
    const base = new MemoryStorage()

    await base.set('k', { name: 'legacy' })

    const s = enhanceStorage(base, {
      migrations: { 1: (d: any) => ({ ...d, upgraded: true }) }
    })

    const [a, b] = await Promise.all([s.get('k'), s.get('k')])

    expect(a).toEqual({ name: 'legacy', upgraded: true })
    expect(b).toEqual({ name: 'legacy', upgraded: true })

    const raw = await base.get('k') as { __v: number, data: unknown }

    expect(raw.__v).toBe(1)
    expect(raw.data).toEqual({ name: 'legacy', upgraded: true })
  })

  it('forwards delete and has to the base storage', async () => {
    const base = new MemoryStorage()
    const s = enhanceStorage<number>(base)

    await s.set('k', 1)

    expect(await s.has('k')).toBe(true)

    await s.delete('k')

    expect(await s.has('k')).toBe(false)
  })

  it('keys iterator is forwarded when the base exposes one', async () => {
    const base = new MemoryStorage()
    const s = enhanceStorage<number>(base)

    await s.set('a', 1)
    await s.set('b', 2)

    const seen: string[] = []

    for await (const k of s.keys?.() ?? []) {
      seen.push(k)
    }

    expect(seen.sort()).toEqual(['a', 'b'])
  })
})
