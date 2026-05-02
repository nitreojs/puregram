import { MemoryStorage } from '@puregram/storage'
import { Telegram } from 'puregram'
import { describe, expect, it, vi } from 'vitest'

import { rateLimitFilter } from '../src/filter'
import { rateLimit } from '../src/plugin'
import type { AnyUpdate, RateLimitEntry } from '../src/types'

interface RlFilterUpdate {
  kind: 'rlFilter'
  from?: { id: number }
}

interface RlFilterOrphanUpdate {
  kind: 'rlFilterOrphan'
}

declare module '@puregram/api' {
  interface UpdateKindMap {
    rlFilter: RlFilterUpdate
    rlFilterOrphan: RlFilterOrphanUpdate
  }
}

const STUB_BOT = { id: 1, is_bot: true as const, first_name: 'bot', username: 'testbot' }

const u = <T>(value: T) => value as unknown as AnyUpdate

const make = async () => {
  const storage = new MemoryStorage<RateLimitEntry>()
  const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(rateLimit({ storage }))

  await t.start()

  return { t, storage }
}

describe('rateLimitFilter', () => {
  it('returns true while under budget', async () => {
    const { t } = await make()
    const f = rateLimitFilter(t, { limit: 2, window: 60 })
    const update = u({ kind: 'rlFilter', from: { id: 1 } })

    expect(await f(update)).toBe(true)
    expect(await f(update)).toBe(true)

    await t.shutdown()
  })

  it('returns false on block and invokes per-call onLimitExceeded with retryAfter', async () => {
    const { t } = await make()
    const onLimitExceeded = vi.fn()
    const f = rateLimitFilter(t, { limit: 1, window: 60, onLimitExceeded })
    const update = u({ kind: 'rlFilter', from: { id: 1 } })

    expect(await f(update)).toBe(true)
    expect(await f(update)).toBe(false)
    expect(onLimitExceeded).toHaveBeenCalledTimes(1)
    expect(onLimitExceeded.mock.calls[0]?.[0]).toBe(update)
    expect(typeof onLimitExceeded.mock.calls[0]?.[1]).toBe('number')

    await t.shutdown()
  })

  it('falls back to plugin-level onLimitExceeded when per-call is absent', async () => {
    const onLimitExceeded = vi.fn()
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT })
      .extend(rateLimit({ onLimitExceeded }))

    await t.start()

    const f = rateLimitFilter(t, { limit: 1, window: 60 })
    const update = u({ kind: 'rlFilter', from: { id: 7 } })

    await f(update)
    await f(update)

    expect(onLimitExceeded).toHaveBeenCalledTimes(1)
    expect(onLimitExceeded.mock.calls[0]?.[0]).toBe(update)

    await t.shutdown()
  })

  it('default onLimitExceeded is silent', async () => {
    const { t } = await make()
    const f = rateLimitFilter(t, { limit: 1, window: 60 })
    const update = u({ kind: 'rlFilter', from: { id: 1 } })

    await f(update)
    // second call blocks but should not throw or otherwise observable
    await expect(f(update)).resolves.toBe(false)

    await t.shutdown()
  })

  it('passes through unkeyable updates without writing storage', async () => {
    const { t, storage } = await make()
    const onLimitExceeded = vi.fn()
    const f = rateLimitFilter(t, { limit: 1, window: 60, onLimitExceeded })
    const update = u({ kind: 'rlFilterOrphan' })

    expect(await f(update)).toBe(true)
    expect(await f(update)).toBe(true)
    expect(onLimitExceeded).not.toHaveBeenCalled()
    expect(storage.size).toBe(0)

    await t.shutdown()
  })

  it('different buckets gate independently for the same user', async () => {
    const { t } = await make()
    const a = rateLimitFilter(t, { limit: 1, window: 60, bucket: 'a' })
    const b = rateLimitFilter(t, { limit: 1, window: 60, bucket: 'b' })
    const update = u({ kind: 'rlFilter', from: { id: 5 } })

    expect(await a(update)).toBe(true)
    expect(await a(update)).toBe(false)
    expect(await b(update)).toBe(true)

    await t.shutdown()
  })
})
