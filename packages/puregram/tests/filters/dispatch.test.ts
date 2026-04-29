import { describe, expect, it } from 'vitest'

import { Dispatcher } from '../../src/dispatch/on'

describe('dispatcher kinds-metadata fast-path', () => {
  it('skips predicate eval for kinds outside the metadata hint', async () => {
    const d = new Dispatcher()

    let calls = 0

    const predicate = (_u: unknown) => {
      calls++

      return false
    }

    Object.defineProperty(predicate, 'kinds', { value: ['message'] })

    d.add({ type: 'predicate', predicate, handler: () => undefined, priority: 'normal' })

    await d.runUserHandlers({ kind: 'callback_query' } as any)
    expect(calls).toBe(0)

    await d.runUserHandlers({ kind: 'message' } as any)
    expect(calls).toBe(1)
  })

  it('always evaluates bare predicates without kinds metadata', async () => {
    const d = new Dispatcher()

    let calls = 0

    const predicate = (_u: unknown) => {
      calls++

      return false
    }

    d.add({ type: 'predicate', predicate, handler: () => undefined, priority: 'normal' })

    await d.runUserHandlers({ kind: 'callback_query' } as any)
    await d.runUserHandlers({ kind: 'message' } as any)

    expect(calls).toBe(2)
  })
})
