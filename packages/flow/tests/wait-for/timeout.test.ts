import { Telegram } from 'puregram'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { flow, WaitForTimeout } from '../../src'

const STUB_BOT = { id: 1, is_bot: true, first_name: 'stub', username: 'stubbot' } as any

const tg = () => new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow())

describe('waitFor — timeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('throws WaitForTimeout when no update arrives within timeout', async () => {
    const t = tg()

    await t.start()

    const promise = (t as any).flow.waitFor('message', { timeout: 1000 })

    vi.advanceTimersByTime(1000)
    await expect(promise).rejects.toBeInstanceOf(WaitForTimeout)

    await t.shutdown()
  })

  it('returns null on timeout when nullOnTimeout is true', async () => {
    const t = tg()

    await t.start()

    const promise = (t as any).flow.waitFor('message', { timeout: 1000, nullOnTimeout: true })

    vi.advanceTimersByTime(1000)
    await expect(promise).resolves.toBeNull()

    await t.shutdown()
  })

  it('cancelAll rejects pending waiters', async () => {
    const t = tg()

    await t.start()

    const promise = (t as any).flow.waitFor('message')

    ;(t as any).flow.cancelAll()
    await expect(promise).rejects.toMatchObject({ name: 'WaitForCancelled' })

    await t.shutdown()
  })

  it('shutdown cancels pending waiters', async () => {
    const t = tg()

    await t.start()

    const promise = (t as any).flow.waitFor('message')

    await t.shutdown()
    await expect(promise).rejects.toMatchObject({ name: 'WaitForCancelled' })
  })
})
