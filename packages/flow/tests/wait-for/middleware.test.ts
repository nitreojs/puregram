import type { Telegram } from 'puregram'
import { describe, expect, it, vi } from 'vitest'

import { createWaitForMiddleware } from '../../src/wait-for/middleware'
import { WaiterRegistry } from '../../src/wait-for/registry'
import { Waiter } from '../../src/wait-for/waiter'

describe('createWaitForMiddleware', () => {
  it('matches a pending waiter and consumes (does not call next)', async () => {
    const reg = new WaiterRegistry()
    const waiter = new Waiter<'message'>('message', {})

    reg.register(waiter)

    const mw = createWaitForMiddleware(reg)
    const next = vi.fn(async () => {})
    const update = { kind: 'message', id: 1 } as any

    await mw(update, next)

    expect(next).not.toHaveBeenCalled()
    await expect(waiter.promise).resolves.toEqual(update)
  })

  it('passes through (calls next) when no waiter matches', async () => {
    const reg = new WaiterRegistry()
    const mw = createWaitForMiddleware(reg)
    const next = vi.fn(async () => {})

    await mw({ kind: 'message' } as any, next)

    expect(next).toHaveBeenCalledOnce()
  })

  it('passes through when consume is false, but still resolves the waiter', async () => {
    const reg = new WaiterRegistry()
    const waiter = new Waiter<'message'>('message', { consume: false })

    reg.register(waiter)

    const mw = createWaitForMiddleware(reg)
    const next = vi.fn(async () => {})
    const update = { kind: 'message', id: 7 } as any

    await mw(update, next)

    expect(next).toHaveBeenCalledOnce()
    await expect(waiter.promise).resolves.toEqual(update)
  })

  it('ignores updates without a string kind', async () => {
    const reg = new WaiterRegistry()
    const mw = createWaitForMiddleware(reg)
    const next = vi.fn(async () => {})

    await mw({} as any, next)

    expect(next).toHaveBeenCalledOnce()
  })

  it('sends validate feedback to the originating chat and re-arms the waiter', async () => {
    const reg = new WaiterRegistry()
    const waiter = new Waiter<'message'>('message', {
      validate: () => 'must be a number'
    })

    reg.register(waiter)

    const send = vi.fn(() => Promise.resolve({}))
    const tg = { send } as unknown as Telegram
    const mw = createWaitForMiddleware(reg, tg)
    const next = vi.fn(async () => {})
    const update = { kind: 'message', chat: { id: 42 }, text: 'foo' } as any

    await mw(update, next)

    expect(send).toHaveBeenCalledWith(42, 'must be a number')
    expect(next).toHaveBeenCalledOnce()
    expect(reg.size('message')).toBe(1)
  })

  it('resolves the waiter armed for the update chat, not the queue head', async () => {
    const reg = new WaiterRegistry()
    const first = new Waiter<'message'>('message', { filter: u => (u as any).chat.id === 1 })
    const second = new Waiter<'message'>('message', { filter: u => (u as any).chat.id === 2 })

    reg.register(first)
    reg.register(second)

    const mw = createWaitForMiddleware(reg)
    const next = vi.fn(async () => {})
    const update = { kind: 'message', chat: { id: 2 }, text: 'hi' } as any

    await mw(update, next)

    expect(next).not.toHaveBeenCalled()
    await expect(second.promise).resolves.toEqual(update)
    expect(reg.size('message')).toBe(1)
  })
})
