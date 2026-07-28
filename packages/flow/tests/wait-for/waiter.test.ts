import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { WaitForCancelled, WaitForTimeout } from '../../src/errors'
import { Waiter } from '../../src/wait-for/waiter'

describe('Waiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves with the matched update', async () => {
    const waiter = new Waiter<'message'>('message', { filter: u => (u as any).id === 1 })

    waiter.resolve({ id: 1 } as any)

    await expect(waiter.promise).resolves.toEqual({ id: 1 })
  })

  it('accepts() returns true only when filter matches', () => {
    const waiter = new Waiter<'message'>('message', { filter: u => (u as any).id === 1 })

    expect(waiter.accepts({ id: 1 } as any)).toBe(true)
    expect(waiter.accepts({ id: 2 } as any)).toBe(false)
  })

  it('accepts() returns true unconditionally when no filter is provided', () => {
    const waiter = new Waiter<'message'>('message', {})

    expect(waiter.accepts({ id: 99 } as any)).toBe(true)
  })

  it('schedules a timeout that rejects with WaitForTimeout', async () => {
    const waiter = new Waiter<'message'>('message', { timeout: 1000 })

    vi.advanceTimersByTime(1000)

    await expect(waiter.promise).rejects.toBeInstanceOf(WaitForTimeout)
  })

  it('returns null on timeout when nullOnTimeout is true', async () => {
    const waiter = new Waiter<'message'>('message', { timeout: 1000, nullOnTimeout: true })

    vi.advanceTimersByTime(1000)

    await expect(waiter.promise).resolves.toBeNull()
  })

  it('cancel() rejects with WaitForCancelled and clears the timer', async () => {
    const waiter = new Waiter<'message'>('message', { timeout: 5000 })

    waiter.cancel()

    await expect(waiter.promise).rejects.toBeInstanceOf(WaitForCancelled)

    // advancing past the timeout must not double-settle
    vi.advanceTimersByTime(5000)
  })

  it('resolve() clears the timer', async () => {
    const waiter = new Waiter<'message'>('message', { timeout: 5000 })

    waiter.resolve({ id: 1 } as any)

    await expect(waiter.promise).resolves.toEqual({ id: 1 })

    // would have rejected if timer still live
    vi.advanceTimersByTime(5000)
  })

  it('consume defaults to true; consume:false respected', () => {
    const a = new Waiter<'message'>('message', {})

    expect(a.consume).toBe(true)

    const b = new Waiter<'message'>('message', { consume: false })

    expect(b.consume).toBe(false)
  })
})

describe('Waiter validate/transform', () => {
  it('validate() returns false when validate returns false', () => {
    const waiter = new Waiter<'message'>('message', {
      validate: m => (m as any).text === 'ok'
    })

    expect(waiter.validate({ text: 'no' } as any)).toBe(false)
    expect(waiter.validate({ text: 'ok' } as any)).toBe(true)
  })

  it('validate() returns true when no validate is provided', () => {
    const waiter = new Waiter<'message'>('message', {})

    expect(waiter.validate({ text: 'anything' } as any)).toBe(true)
  })

  it('exposes validate string feedback via the lastValidationFeedback channel', () => {
    const waiter = new Waiter<'message'>('message', {
      validate: () => 'must be a number'
    })

    waiter.validate({ text: 'x' } as any)

    expect(waiter.lastValidationFeedback).toBe('must be a number')
  })

  it('clears lastValidationFeedback on a subsequent passing validate', () => {
    const waiter = new Waiter<'message'>('message', {
      validate: m => (m as any).text === 'ok' || 'must say ok'
    })

    waiter.validate({ text: 'no' } as any)
    expect(waiter.lastValidationFeedback).toBe('must say ok')

    waiter.validate({ text: 'ok' } as any)
    expect(waiter.lastValidationFeedback).toBeUndefined()
  })

  it('resolve() applies transform to the update before settling the promise', async () => {
    const waiter = new Waiter<'message', number>('message', {
      transform: m => Number((m as any).text)
    })

    waiter.resolve({ text: '42' } as any)

    await expect(waiter.promise).resolves.toBe(42)
  })
})
