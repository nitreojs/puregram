import { describe, it, expect, vi } from 'vitest'
import { Dispatcher } from '../../src/dispatch/on'

describe('Dispatcher', () => {
  it('routes updates to handlers matching the kind', async () => {
    const d = new Dispatcher()
    const messageH = vi.fn()
    const callbackH = vi.fn()

    d.on('message', messageH)
    d.on('callback_query', callbackH)

    await d.runUserHandlers({ kind: 'message' } as any)
    expect(messageH).toHaveBeenCalledOnce()
    expect(callbackH).not.toHaveBeenCalled()
  })

  it('supports off()', async () => {
    const d = new Dispatcher()
    const h = vi.fn()
    d.on('message', h)
    d.off('message', h)
    await d.runUserHandlers({ kind: 'message' } as any)
    expect(h).not.toHaveBeenCalled()
  })

  it('runs multiple handlers in registration order', async () => {
    const d = new Dispatcher()
    const trace: string[] = []
    d.on('message', () => { trace.push('a') })
    d.on('message', () => { trace.push('b') })
    await d.runUserHandlers({ kind: 'message' } as any)
    expect(trace).toEqual(['a', 'b'])
  })
})
