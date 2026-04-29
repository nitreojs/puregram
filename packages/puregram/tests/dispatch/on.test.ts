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

  it('chains handlers in registration order when each calls next()', async () => {
    const d = new Dispatcher()
    const trace: string[] = []

    d.on('message', async (_u, next) => {
      trace.push('a')
      await next()
    })
    d.on('message', async (_u, next) => {
      trace.push('b')
      await next()
    })
    d.on('message', () => {
      trace.push('c')
    })

    await d.runUserHandlers({ kind: 'message' } as any)
    expect(trace).toEqual(['a', 'b', 'c'])
  })

  it('halts the chain when a handler returns without calling next()', async () => {
    const d = new Dispatcher()
    const trace: string[] = []

    d.on('message', () => {
      trace.push('a')
    })
    d.on('message', () => {
      trace.push('b')
    })

    await d.runUserHandlers({ kind: 'message' } as any)
    expect(trace).toEqual(['a'])
  })

  it('predicate entry fires when predicate returns truthy', async () => {
    const d = new Dispatcher()
    const h = vi.fn()

    d.add({
      type: 'predicate',
      predicate: u => u.kind === 'message',
      handler: h,
      priority: 'normal'
    })

    await d.runUserHandlers({ kind: 'message' } as any)
    await d.runUserHandlers({ kind: 'callback_query' } as any)

    expect(h).toHaveBeenCalledOnce()
  })

  it('predicate entry does not fire when predicate returns falsy', async () => {
    const d = new Dispatcher()
    const h = vi.fn()

    d.add({
      type: 'predicate',
      predicate: () => false,
      handler: h,
      priority: 'normal'
    })

    await d.runUserHandlers({ kind: 'message' } as any)
    expect(h).not.toHaveBeenCalled()
  })

  it('predicate throw bubbles out of runUserHandlers', async () => {
    const d = new Dispatcher()

    d.add({
      type: 'predicate',
      predicate: () => {
        throw new Error('boom')
      },
      handler: vi.fn(),
      priority: 'normal'
    })

    await expect(d.runUserHandlers({ kind: 'message' } as any))
      .rejects.toThrow('boom')
  })

  it('preserves registration order across kind and predicate entries (same priority)', async () => {
    const d = new Dispatcher()
    const trace: string[] = []
    const passThrough = (label: string) => async (_u: unknown, next: () => Promise<void>) => {
      trace.push(label)
      await next()
    }

    d.on('message', passThrough('kind1'))
    d.add({
      type: 'predicate',
      predicate: u => u.kind === 'message',
      handler: passThrough('pred'),
      priority: 'normal'
    })
    d.on('message', passThrough('kind2'))

    await d.runUserHandlers({ kind: 'message' } as any)
    expect(trace).toEqual(['kind1', 'pred', 'kind2'])
  })

  it('priority groups dispatch high → normal → low; registration order within group', async () => {
    const d = new Dispatcher()
    const trace: string[] = []
    const passThrough = (label: string) => async (_u: unknown, next: () => Promise<void>) => {
      trace.push(label)
      await next()
    }

    d.on('message', passThrough('normal-1'), 'normal')
    d.on('message', passThrough('high-1'), 'high')
    d.on('message', passThrough('normal-2'), 'normal')
    d.on('message', passThrough('low-1'), 'low')
    d.on('message', passThrough('high-2'), 'high')

    await d.runUserHandlers({ kind: 'message' } as any)
    expect(trace).toEqual(['high-1', 'high-2', 'normal-1', 'normal-2', 'low-1'])
  })

  it('mixing kind + predicate within the same priority preserves registration order', async () => {
    const d = new Dispatcher()
    const trace: string[] = []
    const passThrough = (label: string) => async (_u: unknown, next: () => Promise<void>) => {
      trace.push(label)
      await next()
    }

    d.add({
      type: 'predicate',
      predicate: () => true,
      handler: passThrough('pred-high'),
      priority: 'high'
    })
    d.on('message', passThrough('kind-normal'), 'normal')
    d.add({
      type: 'predicate',
      predicate: () => true,
      handler: passThrough('pred-normal'),
      priority: 'normal'
    })

    await d.runUserHandlers({ kind: 'message' } as any)
    expect(trace).toEqual(['pred-high', 'kind-normal', 'pred-normal'])
  })

  it('off() during dispatch does not shift the live cursor', async () => {
    const d = new Dispatcher()
    const trace: string[] = []
    const a = async (_u: unknown, next: () => Promise<void>) => {
      trace.push('a')
      d.off('message', a)
      await next()
    }
    const b = () => {
      trace.push('b')
    }

    d.on('message', a)
    d.on('message', b)

    await d.runUserHandlers({ kind: 'message' } as any)
    expect(trace).toEqual(['a', 'b'])
  })

  it('off() on a non-registered (kind, fn) pair is a no-op', () => {
    const d = new Dispatcher()
    const h = vi.fn()

    expect(() => d.off('message', h)).not.toThrow()
  })
})
