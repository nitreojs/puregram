import { MemoryStorage } from '@puregram/storage'
import { Telegram } from 'puregram'
import { describe, expect, it } from 'vitest'

import { rateLimit } from '../src/plugin'
import type { AnyUpdate, RateLimitEntry } from '../src/types'

interface RlProbeUpdate {
  kind: 'rlProbe'
  from?: { id: number }
}

interface RlOrphanUpdate {
  kind: 'rlOrphan'
}

declare module '@puregram/api' {
  interface UpdateKindMap {
    rlProbe: RlProbeUpdate
    rlOrphan: RlOrphanUpdate
  }
}

const STUB_BOT = { id: 1, is_bot: true as const, first_name: 'bot', username: 'testbot' }

const makeTg = (storage = new MemoryStorage<RateLimitEntry>()) =>
  new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(rateLimit({ storage }))

const u = <T>(value: T) => value as unknown as AnyUpdate

describe('rateLimit() — install shape', () => {
  it('exposes { check, hit, reset, storage, resolveKey, onLimitExceeded } under tg.rateLimit', async () => {
    const t = makeTg()

    await t.start()

    expect(typeof t.rateLimit.check).toBe('function')
    expect(typeof t.rateLimit.hit).toBe('function')
    expect(typeof t.rateLimit.reset).toBe('function')
    expect(typeof t.rateLimit.resolveKey).toBe('function')
    expect(t.rateLimit.storage).toBeInstanceOf(MemoryStorage)

    await t.shutdown()
  })

  it('default storage is a fresh MemoryStorage', async () => {
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(rateLimit())

    await t.start()

    expect(t.rateLimit.storage).toBeInstanceOf(MemoryStorage)

    await t.shutdown()
  })
})

describe('tg.rateLimit.hit', () => {
  it('returns null while under budget then retry-after seconds when over', async () => {
    const t = makeTg()

    await t.start()

    expect(await t.rateLimit.hit('k', 2, 60)).toBeNull()
    expect(await t.rateLimit.hit('k', 2, 60)).toBeNull()

    const blocked = await t.rateLimit.hit('k', 2, 60)

    expect(typeof blocked).toBe('number')
    expect(blocked).toBeGreaterThan(0)

    await t.shutdown()
  })

  it('reset clears the bucket', async () => {
    const t = makeTg()

    await t.start()
    await t.rateLimit.hit('k', 1, 60)

    expect(await t.rateLimit.hit('k', 1, 60)).not.toBeNull()

    await t.rateLimit.reset('k')

    expect(await t.rateLimit.hit('k', 1, 60)).toBeNull()

    await t.shutdown()
  })
})

describe('tg.rateLimit.check', () => {
  it('passes through unkeyable updates without writing storage', async () => {
    const storage = new MemoryStorage<RateLimitEntry>()
    const t = makeTg(storage)

    await t.start()

    expect(await t.rateLimit.check(u({ kind: 'rlOrphan' }), { limit: 1, window: 60 })).toBeNull()
    expect(await t.rateLimit.check(u({ kind: 'rlOrphan' }), { limit: 1, window: 60 })).toBeNull()

    expect(storage.size).toBe(0)

    await t.shutdown()
  })

  it('uses the resolved per-user key composed with the bucket', async () => {
    const storage = new MemoryStorage<RateLimitEntry>()
    const t = makeTg(storage)

    await t.start()

    const update = u({ kind: 'rlProbe', from: { id: 42 } })

    expect(await t.rateLimit.check(update, { limit: 2, window: 60, bucket: 'pay' })).toBeNull()
    expect(await t.rateLimit.check(update, { limit: 2, window: 60, bucket: 'pay' })).toBeNull()

    const blocked = await t.rateLimit.check(update, { limit: 2, window: 60, bucket: 'pay' })

    expect(blocked).not.toBeNull()
    expect(await storage.get('pay:42')).toBeDefined()
    expect(await storage.get('default:42')).toBeUndefined()

    await t.shutdown()
  })

  it('different buckets are independent for the same user', async () => {
    const t = makeTg()

    await t.start()

    const update = u({ kind: 'rlProbe', from: { id: 9 } })

    expect(await t.rateLimit.check(update, { limit: 1, window: 60, bucket: 'a' })).toBeNull()

    expect(await t.rateLimit.check(update, { limit: 1, window: 60, bucket: 'a' })).not.toBeNull()
    expect(await t.rateLimit.check(update, { limit: 1, window: 60, bucket: 'b' })).toBeNull()

    await t.shutdown()
  })
})

describe('tg.rateLimit.resolveKey', () => {
  it('returns composed key for keyable updates', async () => {
    const t = makeTg()

    await t.start()

    expect(t.rateLimit.resolveKey(u({ kind: 'rlProbe', from: { id: 5 } }), 'cb')).toBe('cb:5')
    expect(t.rateLimit.resolveKey(u({ kind: 'rlProbe', from: { id: 5 } }))).toBe('default:5')

    await t.shutdown()
  })

  it('returns undefined for unkeyable updates', async () => {
    const t = makeTg()

    await t.start()

    expect(t.rateLimit.resolveKey(u({ kind: 'rlOrphan' }))).toBeUndefined()

    await t.shutdown()
  })
})
