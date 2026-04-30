import { and, defineAsyncFilter, defineFilter } from '@puregram/api'
import { describe, expect, it, vi } from 'vitest'

import { Dispatcher } from '../../src/dispatch/on'
import { Telegram } from '../../src/telegram'

const STUB_BOT = { id: 1, is_bot: true, first_name: 'stub', username: 'stubbot' } as any

const messageUpdate = (text?: string) => ({
  kind: 'message',
  raw: { message_id: 1, date: 0, chat: { id: 100, type: 'private' }, text }
})

describe('async predicate dispatch', () => {
  it('awaits a promise-returning predicate before invoking the handler', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const trace: string[] = []

    tg.onUpdate(
      async (update) => {
        await Promise.resolve()
        trace.push('predicate')

        return update.kind === 'message'
      },
      (update) => {
        trace.push(`handler:${update.kind}`)
      }
    )

    await (tg as any).dispatch(messageUpdate('hi'))
    expect(trace).toEqual(['predicate', 'handler:message'])
  })

  it('skips the handler when the awaited result is false', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const handler = vi.fn()

    tg.onUpdate(
      async () => {
        await Promise.resolve()

        return false
      },
      handler
    )

    await (tg as any).dispatch(messageUpdate('hi'))
    expect(handler).not.toHaveBeenCalled()
  })

  it('does not await sync predicates that return raw booleans', async () => {
    const d = new Dispatcher()

    let predicateCalls = 0
    let returnedThenable = false

    const predicate = (_u: unknown) => {
      predicateCalls++

      const value = true as boolean | Promise<boolean>

      if (typeof value === 'object' && value !== null && 'then' in (value as object)) {
        returnedThenable = true
      }

      return value
    }

    d.add({
      type: 'predicate',
      predicate,
      handler: () => undefined,
      priority: 'normal'
    })

    await d.runUserHandlers({ kind: 'message' } as any)

    expect(predicateCalls).toBe(1)
    expect(returnedThenable).toBe(false)
  })
})

describe('defineAsyncFilter composition', () => {
  it('composes a sync filter with an async filter via and()', async () => {
    const isMessage = defineFilter(
      'isMessage',
      (update: unknown): update is { kind: 'message' } =>
        typeof update === 'object' && update !== null && (update as { kind?: unknown }).kind === 'message'
    )

    const slowTruthy = defineAsyncFilter('slowTruthy', async () => {
      await Promise.resolve()

      return true
    })

    // typing: `and()` declares a sync `Filter<T>` return shape, but the runtime promotes
    // to an async filter when any operand is async. cast through the boolean-or-promise
    // signature to await the result without fighting the public type
    const combined = and(isMessage, slowTruthy) as unknown as (u: unknown) => boolean | Promise<boolean>
    const result = await combined({ kind: 'message' })

    expect(result).toBe(true)

    const negative = await combined({ kind: 'callback_query' })

    expect(negative).toBe(false)
  })

  it('runs an async filter through the dispatcher predicate path', async () => {
    const tg = new Telegram({ token: 'X', bot: STUB_BOT })
    const seen: string[] = []

    const asyncMessage = defineAsyncFilter('asyncMessage', async (update) => {
      await Promise.resolve()

      return (update as { kind: string }).kind === 'message'
    })

    tg.onUpdate(asyncMessage, (update) => {
      seen.push(update.kind)
    })

    await (tg as any).dispatch(messageUpdate('hi'))
    await (tg as any).dispatch({ kind: 'callback_query', raw: { id: '1' } })

    expect(seen).toEqual(['message'])
  })
})
