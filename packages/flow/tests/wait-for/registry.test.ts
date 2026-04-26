import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { WaiterRegistry } from '../../src/wait-for/registry'
import { Waiter } from '../../src/wait-for/waiter'

describe('WaiterRegistry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('match returns first matching waiter and removes it', () => {
    const reg = new WaiterRegistry()
    const a = new Waiter<'message'>('message', { filter: u => (u as any).id === 1 })
    const b = new Waiter<'message'>('message', { filter: u => (u as any).id === 1 })

    reg.register(a)
    reg.register(b)

    const matched = reg.match('message', { id: 1 } as any)

    expect(matched).toBe(a)

    // a removed; b still pending
    const matchedAgain = reg.match('message', { id: 1 } as any)

    expect(matchedAgain).toBe(b)

    // both gone now
    expect(reg.match('message', { id: 1 } as any)).toBeUndefined()
  })

  it('skips non-matching waiters and matches the first that does', () => {
    const reg = new WaiterRegistry()
    const a = new Waiter<'message'>('message', { filter: u => (u as any).id === 99 })
    const b = new Waiter<'message'>('message', { filter: u => (u as any).id === 1 })

    reg.register(a)
    reg.register(b)

    const matched = reg.match('message', { id: 1 } as any)

    expect(matched).toBe(b)

    // a still in queue
    expect(reg.size('message')).toBe(1)
  })

  it('returns undefined when no waiter for the kind', () => {
    const reg = new WaiterRegistry()

    expect(reg.match('callback_query', { id: 'q' } as any)).toBeUndefined()
  })

  it('does not match across different kinds', () => {
    const reg = new WaiterRegistry()
    const a = new Waiter<'message'>('message', {})

    reg.register(a)

    expect(reg.match('callback_query', {} as any)).toBeUndefined()
    expect(reg.size('message')).toBe(1)
  })

  it('cancelAll cancels every pending waiter and empties the registry', async () => {
    const reg = new WaiterRegistry()
    const a = new Waiter<'message'>('message', {})
    const b = new Waiter<'callback_query'>('callback_query', {})

    reg.register(a)
    reg.register(b)

    reg.cancelAll()

    await expect(a.promise).rejects.toMatchObject({ name: 'WaitForCancelled' })
    await expect(b.promise).rejects.toMatchObject({ name: 'WaitForCancelled' })
    expect(reg.size('message')).toBe(0)
    expect(reg.size('callback_query')).toBe(0)
  })

  it('settled waiters self-evict on the next match call', async () => {
    // a waiter whose timeout already fired must not block the FIFO queue
    const reg = new WaiterRegistry()
    const a = new Waiter<'message'>('message', { timeout: 100 })
    const b = new Waiter<'message'>('message', {})

    reg.register(a)
    reg.register(b)

    vi.advanceTimersByTime(100)
    await a.promise.catch(() => undefined)

    const matched = reg.match('message', { id: 1 } as any)

    expect(matched).toBe(b)
  })
})
