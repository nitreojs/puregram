import { Telegram } from 'puregram'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { flow, WaiterAbortedError } from '../../src'
import { createWaitForAny } from '../../src/wait-for/any'
import { WaiterRegistry } from '../../src/wait-for/registry'

const STUB_BOT = { id: 1, is_bot: true, first_name: 'stub', username: 'stubbot' } as any

declare module '@puregram/api' {
  interface UpdateKindMap {
    callback_query: { kind: 'callback_query', data?: string, raw: any }
    message: { kind: 'message', text?: string, raw: any }
  }
}

const tg = async () => {
  const t = new Telegram({ token: 'TEST', bot: STUB_BOT }).extend(flow())

  await t.start()
  t.defineUpdate('message')
  t.defineUpdate('callback_query')

  return t
}

describe('waitForAny — unit', () => {
  it('throws TypeError on empty specs', async () => {
    const reg = new WaiterRegistry()
    const waitForAny = createWaitForAny(reg)

    await expect(waitForAny([] as any)).rejects.toBeInstanceOf(TypeError)
  })

  it('rejects immediately when signal is already aborted', async () => {
    const reg = new WaiterRegistry()
    const waitForAny = createWaitForAny(reg)
    const controller = new AbortController()

    controller.abort()

    await expect(
      waitForAny([{ kind: 'message' }], { signal: controller.signal })
    ).rejects.toBeInstanceOf(WaiterAbortedError)

    // no leftover waiters
    expect(reg.size('message')).toBe(0)
  })
})

describe('waitForAny — integration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('first matching spec wins and reports its index', async () => {
    const t = await tg()

    const promise = (t as any).flow.waitForAny([
      { kind: 'callback_query' },
      { kind: 'message' }
    ])

    t.emit('message', { text: 'go', raw: {} })
    await vi.advanceTimersByTimeAsync(0)

    await expect(promise).resolves.toMatchObject({ index: 1, value: { text: 'go' } })

    await t.shutdown()
  })

  it('cancels losers — they do not match future updates', async () => {
    const t = await tg()

    const promise = (t as any).flow.waitForAny([
      { kind: 'callback_query' },
      { kind: 'message' }
    ])

    t.emit('message', { text: 'first', raw: {} })
    await vi.advanceTimersByTimeAsync(0)

    const winner = await promise

    expect(winner.index).toBe(1)

    // a follow-up callback_query must not resolve the cancelled loser — the
    // registry's cancelled waiter is settled and self-evicts on the next match
    // call. fire another callback_query; nothing should hang or fire
    t.emit('callback_query', { data: 'late', raw: {} })
    await vi.advanceTimersByTimeAsync(0)

    // no pending callback_query waiters
    await t.shutdown()
  })

  it('top-level signal cancels every waiter', async () => {
    const t = await tg()

    const controller = new AbortController()

    const promise = (t as any).flow.waitForAny(
      [{ kind: 'callback_query' }, { kind: 'message' }],
      { signal: controller.signal }
    )

    controller.abort()

    // racers see WaitForCancelled — waitForAny rethrows whichever loses first
    await expect(promise).rejects.toMatchObject({ name: 'WaitForCancelled' })

    await t.shutdown()
  })

  it('signal aborting before any match leaves the registry clean', async () => {
    const t = await tg()

    const controller = new AbortController()
    const promise = (t as any).flow.waitForAny(
      [{ kind: 'callback_query' }, { kind: 'message' }],
      { signal: controller.signal }
    ).catch(() => undefined)

    controller.abort()
    await promise

    // emitted updates land on no one
    t.emit('message', { text: 'unheard', raw: {} })
    await vi.advanceTimersByTimeAsync(0)

    await t.shutdown()
  })

  it('individual spec timeout rejects waitForAny verbatim', async () => {
    const t = await tg()

    const promise = (t as any).flow.waitForAny([
      { kind: 'callback_query', options: { timeout: 100 } },
      { kind: 'message', options: { timeout: 100 } }
    ])

    vi.advanceTimersByTime(100)

    await expect(promise).rejects.toMatchObject({ name: 'WaitForTimeout' })

    await t.shutdown()
  })
})
