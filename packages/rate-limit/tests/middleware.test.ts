import { MemoryStorage } from '@puregram/storage'
import { Telegram } from 'puregram'
import { describe, expect, it, vi } from 'vitest'

import { rateLimitMiddleware } from '../src/middleware'
import { rateLimit } from '../src/plugin'
import type { AnyUpdate, RateLimitEntry } from '../src/types'

interface RlMwUpdate {
  kind: 'rlMw'
  from?: { id: number }
}

interface RlMwOrphanUpdate {
  kind: 'rlMwOrphan'
}

declare module '@puregram/api' {
  interface UpdateKindMap {
    rlMw: RlMwUpdate
    rlMwOrphan: RlMwOrphanUpdate
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

describe('rateLimitMiddleware', () => {
  it('calls next() while under budget', async () => {
    const { t } = await make()
    const mw = rateLimitMiddleware(t, { limit: 2, window: 60 })
    const next = vi.fn(() => Promise.resolve())

    await mw(u({ kind: 'rlMw', from: { id: 1 } }), next)
    await mw(u({ kind: 'rlMw', from: { id: 1 } }), next)

    expect(next).toHaveBeenCalledTimes(2)

    await t.shutdown()
  })

  it('does not call next() on block; invokes onLimitExceeded', async () => {
    const { t } = await make()
    const onLimitExceeded = vi.fn()
    const mw = rateLimitMiddleware(t, { limit: 1, window: 60, onLimitExceeded })
    const next = vi.fn(() => Promise.resolve())
    const update = u({ kind: 'rlMw', from: { id: 2 } })

    await mw(update, next)
    await mw(update, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(onLimitExceeded).toHaveBeenCalledTimes(1)
    expect(onLimitExceeded.mock.calls[0]?.[0]).toBe(update)

    await t.shutdown()
  })

  it('default onLimitExceeded is silent', async () => {
    const { t } = await make()
    const mw = rateLimitMiddleware(t, { limit: 1, window: 60 })
    const next = vi.fn(() => Promise.resolve())
    const update = u({ kind: 'rlMw', from: { id: 3 } })

    await mw(update, next)
    await expect(mw(update, next)).resolves.toBeUndefined()
    expect(next).toHaveBeenCalledTimes(1)

    await t.shutdown()
  })

  it('passes unkeyable updates through to next', async () => {
    const { t, storage } = await make()
    const mw = rateLimitMiddleware(t, { limit: 1, window: 60 })
    const next = vi.fn(() => Promise.resolve())

    await mw(u({ kind: 'rlMwOrphan' }), next)
    await mw(u({ kind: 'rlMwOrphan' }), next)

    expect(next).toHaveBeenCalledTimes(2)
    expect(storage.size).toBe(0)

    await t.shutdown()
  })

  it('falls back to plugin-level onLimitExceeded', async () => {
    const onLimitExceeded = vi.fn()
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT })
      .extend(rateLimit({ onLimitExceeded }))

    await t.start()

    const mw = rateLimitMiddleware(t, { limit: 1, window: 60 })
    const next = vi.fn(() => Promise.resolve())
    const update = u({ kind: 'rlMw', from: { id: 9 } })

    await mw(update, next)
    await mw(update, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(onLimitExceeded).toHaveBeenCalledTimes(1)

    await t.shutdown()
  })
})
