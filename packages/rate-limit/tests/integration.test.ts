import { MemoryStorage } from '@puregram/storage'
import { Telegram } from 'puregram'
import { describe, expect, it, vi } from 'vitest'

import { rateLimitFilter } from '../src/filter'
import { rateLimitMiddleware } from '../src/middleware'
import { rateLimit } from '../src/plugin'
import type { RateLimitEntry } from '../src/types'

interface RlIntUpdate {
  kind: 'rlInt'
  from?: { id: number }
  text?: string
}

interface RlIntCbUpdate {
  kind: 'rlIntCb'
  from?: { id: number }
}

declare module '@puregram/api' {
  interface UpdateKindMap {
    rlInt: RlIntUpdate
    rlIntCb: RlIntCbUpdate
  }
}

const STUB_BOT = { id: 1, is_bot: true as const, first_name: 'bot', username: 'testbot' }
const tick = () => new Promise(resolve => setImmediate(resolve))

describe('integration — filter form gates handler', () => {
  it('5 fires of /pay → handler runs 3 times, callback fires twice', async () => {
    const onLimitExceeded = vi.fn()
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT })
      .extend(rateLimit({ storage: new MemoryStorage<RateLimitEntry>() }))

    await t.start()

    const ranOn: number[] = []

    t.defineUpdate('rlInt')
    t.onUpdate(rateLimitFilter(t, { limit: 3, window: 60, bucket: 'pay', onLimitExceeded }), (update) => {
      ranOn.push((update as { from?: { id: number } }).from?.id ?? -1)
    })

    for (let i = 0; i < 5; i++) {
      t.emit('rlInt', { from: { id: 7 }, text: '/pay' })
      await tick()
    }

    expect(ranOn).toEqual([7, 7, 7])
    expect(onLimitExceeded).toHaveBeenCalledTimes(2)

    const calls = onLimitExceeded.mock.calls

    for (const [, retryAfter] of calls) {
      expect(typeof retryAfter).toBe('number')
      expect(retryAfter as number).toBeGreaterThan(0)
    }

    await t.shutdown()
  })

  it('different users have independent budgets', async () => {
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT })
      .extend(rateLimit())

    await t.start()

    const ranOn: number[] = []

    t.defineUpdate('rlInt')
    t.onUpdate(rateLimitFilter(t, { limit: 1, window: 60 }), (update) => {
      ranOn.push((update as { from?: { id: number } }).from?.id ?? -1)
    })

    t.emit('rlInt', { from: { id: 1 } })
    await tick()
    t.emit('rlInt', { from: { id: 1 } })
    await tick()
    t.emit('rlInt', { from: { id: 2 } })
    await tick()

    expect(ranOn).toEqual([1, 2])

    await t.shutdown()
  })
})

describe('integration — middleware form gates onUpdate chain', () => {
  it('onUpdate middleware blocks downstream handlers when over budget', async () => {
    const onLimitExceeded = vi.fn()
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT })
      .extend(rateLimit({ onLimitExceeded }))

    await t.start()

    const ran: number[] = []

    t.defineUpdate('rlInt')
    t.useHook('onUpdate', rateLimitMiddleware(t, { limit: 2, window: 60 }), { priority: 'high' })
    t.onUpdate(u => u.kind === 'rlInt', (update) => {
      ran.push((update as { from?: { id: number } }).from?.id ?? -1)
    })

    for (let i = 0; i < 4; i++) {
      t.emit('rlInt', { from: { id: 5 } })
      await tick()
    }

    expect(ran).toEqual([5, 5])
    expect(onLimitExceeded).toHaveBeenCalledTimes(2)

    await t.shutdown()
  })
})

describe('integration — imperative form inside a handler', () => {
  it('tg.rateLimit.check inside a handler reports retry-after', async () => {
    const t = new Telegram({ token: 'TEST', bot: STUB_BOT })
      .extend(rateLimit())

    await t.start()

    const outcomes: (number | null)[] = []

    t.defineUpdate('rlIntCb')
    t.onUpdate(u => u.kind === 'rlIntCb', async (update) => {
      const retry = await t.rateLimit.check(update, { limit: 5, window: 10, bucket: 'cb' })

      outcomes.push(retry)
    })

    for (let i = 0; i < 7; i++) {
      t.emit('rlIntCb', { from: { id: 99 } })
      await tick()
    }

    expect(outcomes.slice(0, 5)).toEqual([null, null, null, null, null])
    expect(outcomes[5]).not.toBeNull()
    expect(outcomes[6]).not.toBeNull()

    await t.shutdown()
  })
})
