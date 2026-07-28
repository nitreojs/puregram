import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { MatchOutcome } from '../../src/wait-for/registry'
import { WaiterRegistry } from '../../src/wait-for/registry'
import { Waiter } from '../../src/wait-for/waiter'

// deep-equality on a Waiter says nothing useful — every assertion here is about identity
function waiterOf (outcome: MatchOutcome<'message'>) {
  return outcome.outcome === 'matched' ? outcome.waiter : undefined
}

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

    expect(waiterOf(reg.match('message', { id: 1 } as any))).toBe(a)

    // a removed; b still pending
    expect(waiterOf(reg.match('message', { id: 1 } as any))).toBe(b)

    // both gone now
    expect(reg.match('message', { id: 1 } as any)).toEqual({ outcome: 'none' })
  })

  it('skips non-matching waiters and matches the first that does', () => {
    const reg = new WaiterRegistry()
    const a = new Waiter<'message'>('message', { filter: u => (u as any).id === 99 })
    const b = new Waiter<'message'>('message', { filter: u => (u as any).id === 1 })

    reg.register(a)
    reg.register(b)

    expect(waiterOf(reg.match('message', { id: 1 } as any))).toBe(b)

    // a still in queue
    expect(reg.size('message')).toBe(1)
  })

  it('matches the waiter armed for the update chat and leaves the other one armed', () => {
    const reg = new WaiterRegistry()
    const first = new Waiter<'message'>('message', { filter: u => (u as any).chat.id === 1 })
    const second = new Waiter<'message'>('message', { filter: u => (u as any).chat.id === 2 })

    reg.register(first)
    reg.register(second)

    expect(waiterOf(reg.match('message', { chat: { id: 2 }, text: 'hi' } as any))).toBe(second)
    expect(reg.size('message')).toBe(1)
    expect(waiterOf(reg.match('message', { chat: { id: 1 }, text: 'hi' } as any))).toBe(first)
  })

  it('reports rejected with feedback when the filter matches but validate fails', () => {
    const reg = new WaiterRegistry()
    const other = new Waiter<'message'>('message', { filter: u => (u as any).chat.id === 1 })
    const waiter = new Waiter<'message'>('message', {
      filter: u => (u as any).chat.id === 2,
      validate: u => Number.isFinite(Number((u as any).text)) || 'must be a number'
    })

    reg.register(other)
    reg.register(waiter)

    expect(reg.match('message', { chat: { id: 2 }, text: 'nope' } as any))
      .toEqual({ outcome: 'rejected', feedback: 'must be a number' })

    // left armed, so a valid retry still resolves it
    expect(reg.size('message')).toBe(2)
    expect(waiterOf(reg.match('message', { chat: { id: 2 }, text: '42' } as any))).toBe(waiter)
  })

  it('returns none when no waiter for the kind', () => {
    const reg = new WaiterRegistry()

    expect(reg.match('callback_query', { id: 'q' } as any)).toEqual({ outcome: 'none' })
  })

  it('does not match across different kinds', () => {
    const reg = new WaiterRegistry()
    const a = new Waiter<'message'>('message', {})

    reg.register(a)

    expect(reg.match('callback_query', {} as any)).toEqual({ outcome: 'none' })
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

    expect(waiterOf(reg.match('message', { id: 1 } as any))).toBe(b)
  })
})
