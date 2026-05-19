import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { WaiterAbortedError } from '../../src/errors'
import { Waiter } from '../../src/wait-for/waiter'

describe('Waiter — signal', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('rejects with WaiterAbortedError when signal aborts', async () => {
    const controller = new AbortController()
    const waiter = new Waiter<'message'>('message', { signal: controller.signal })

    controller.abort('user cancelled')

    await expect(waiter.promise).rejects.toBeInstanceOf(WaiterAbortedError)
    await expect(waiter.promise).rejects.toMatchObject({ cause: 'user cancelled' })
    expect(waiter.settled).toBe(true)
  })

  it('rejects synchronously when signal is already aborted at construction', async () => {
    const controller = new AbortController()

    controller.abort()

    const waiter = new Waiter<'message'>('message', { signal: controller.signal })

    expect(waiter.settled).toBe(true)
    await expect(waiter.promise).rejects.toBeInstanceOf(WaiterAbortedError)
  })

  it('does not leak the abort listener after resolve', async () => {
    const controller = new AbortController()
    const waiter = new Waiter<'message'>('message', { signal: controller.signal })

    waiter.resolve({ id: 1 } as any)

    // aborting after a clean resolve must NOT throw / double-settle
    controller.abort()

    await expect(waiter.promise).resolves.toEqual({ id: 1 })
  })

  it('does not leak the abort listener after timeout', async () => {
    const controller = new AbortController()
    const waiter = new Waiter<'message'>('message', { timeout: 100, signal: controller.signal })

    vi.advanceTimersByTime(100)

    await expect(waiter.promise).rejects.toMatchObject({ name: 'WaitForTimeout' })

    // abort after the fact: must be a no-op
    controller.abort()
  })

  it('does not leak the abort listener after cancel', async () => {
    const controller = new AbortController()
    const waiter = new Waiter<'message'>('message', { signal: controller.signal })

    // listener count via the EventTarget contract is not directly observable, but
    // we can assert the waiter is settled and that a subsequent abort is a no-op
    waiter.cancel()

    expect(waiter.settled).toBe(true)
    await expect(waiter.promise).rejects.toMatchObject({ name: 'WaitForCancelled' })

    // no throw
    controller.abort()
  })
})
