import { MemoryStorage } from '@puregram/storage'
import { describe, expect, it } from 'vitest'

import { hit, reset } from '../src/core'
import type { RateLimitEntry } from '../src/types'

const make = () => new MemoryStorage<RateLimitEntry>()

describe('hit() — fixed-window', () => {
  it('first hit on an empty key starts a fresh window and is allowed', async () => {
    const storage = make()
    const out = await hit(storage, 'k', 3, 60, 1_000_000)

    expect(out).toEqual({ allowed: true })
    expect(await storage.get('k')).toEqual({ hits: 1, resetAt: 1_000_000 + 60_000 })
  })

  it('allows up to `limit` hits within the window then blocks', async () => {
    const storage = make()
    const now = 1_000_000

    expect(await hit(storage, 'k', 3, 60, now)).toEqual({ allowed: true })
    expect(await hit(storage, 'k', 3, 60, now + 100)).toEqual({ allowed: true })
    expect(await hit(storage, 'k', 3, 60, now + 200)).toEqual({ allowed: true })

    const blocked = await hit(storage, 'k', 3, 60, now + 300)

    expect(blocked.allowed).toBe(false)

    if (!blocked.allowed) {
      expect(blocked.retryAfter).toBe(60)
    }
  })

  it('reports retry-after as ceil((resetAt - now) / 1000)', async () => {
    const storage = make()
    const now = 1_000_000

    await hit(storage, 'k', 1, 60, now)
    const blocked = await hit(storage, 'k', 1, 60, now + 30_500)

    if (!blocked.allowed) {
      // 60s - 30.5s = 29.5s → ceil = 30
      expect(blocked.retryAfter).toBe(30)
    } else {
      throw new Error('expected blocked')
    }
  })

  it('rolls into a new window exactly at resetAt', async () => {
    const storage = make()
    const now = 1_000_000

    await hit(storage, 'k', 1, 60, now)

    // second hit one tick before reset is blocked
    const before = await hit(storage, 'k', 1, 60, now + 60_000 - 1)

    expect(before.allowed).toBe(false)

    // hit at resetAt rolls fresh
    const at = await hit(storage, 'k', 1, 60, now + 60_000)

    expect(at).toEqual({ allowed: true })

    const entry = await storage.get('k')

    expect(entry).toEqual({ hits: 1, resetAt: now + 60_000 + 60_000 })
  })

  it('preserves resetAt across in-window hits', async () => {
    const storage = make()
    const now = 1_000_000

    await hit(storage, 'k', 5, 60, now)
    await hit(storage, 'k', 5, 60, now + 1000)
    await hit(storage, 'k', 5, 60, now + 2000)

    const entry = await storage.get('k')

    expect(entry?.resetAt).toBe(now + 60_000)
    expect(entry?.hits).toBe(3)
  })

  it('keys are independent', async () => {
    const storage = make()
    const now = 1_000_000

    await hit(storage, 'a', 1, 60, now)

    expect(await hit(storage, 'a', 1, 60, now)).toMatchObject({ allowed: false })
    expect(await hit(storage, 'b', 1, 60, now)).toEqual({ allowed: true })
  })
})

describe('reset()', () => {
  it('clears the entry', async () => {
    const storage = make()
    const now = 1_000_000

    await hit(storage, 'k', 1, 60, now)

    expect(await hit(storage, 'k', 1, 60, now)).toMatchObject({ allowed: false })

    await reset(storage, 'k')

    expect(await hit(storage, 'k', 1, 60, now)).toEqual({ allowed: true })
  })

  it('is a no-op for absent keys', async () => {
    const storage = make()

    await reset(storage, 'nope')

    expect(await storage.get('nope')).toBeUndefined()
  })
})
