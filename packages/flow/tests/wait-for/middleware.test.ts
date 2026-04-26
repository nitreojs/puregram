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
})
