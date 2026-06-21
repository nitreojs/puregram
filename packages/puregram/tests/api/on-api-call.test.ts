import { describe, it, expect, vi } from 'vitest'

import { runRequest } from '../../src/api/lifecycle'
import { HookRegistry } from '../../src/dispatch/hooks'
import type { HttpClient } from '../../src/http/client'
import type { ResolvedTelegramOptions } from '../../src/options'

const options = () => {
  const out: ResolvedTelegramOptions = {
    token: 'TEST',
    httpClient: undefined,
    apiBaseUrl: 'https://api.telegram.org/bot',
    apiTimeout: 5000,
    apiWait: 1000,
    apiRetryLimit: 0,
    apiHeaders: {},
    useTestDc: false,
    useLocal: false,
    allowedUpdates: [],
    defaultParams: {},
    retryOnFloodWait: false,
    swallowDispatchErrors: false
  }

  return out
}

const ok = (result: unknown) => ({ status: 200, json: () => Promise.resolve({ ok: true, result }) })
const fail = (code: number) => ({ status: 200, json: () => Promise.resolve({ ok: false, error_code: code, description: 'nope' }) })

const deps = (httpClient: HttpClient, hooks: HookRegistry) => ({ options: options(), hooks, httpClient })

describe('onApiCall around-hook', () => {
  it('wraps a successful call and observes method + completion', async () => {
    const hooks = new HookRegistry()
    const events: string[] = []

    hooks.add('onApiCall', async (ctx, next) => {
      events.push(`before:${ctx.method}`)

      await next()

      events.push(`after:${ctx.method}:${ctx.response?.status}`)
    })

    const request = vi.fn().mockResolvedValue(ok({ message_id: 1 }))
    const result = await runRequest(deps({ request }, hooks), 'sendMessage', { chat_id: 1, text: 'hi' })

    expect(result).toEqual({ message_id: 1 })
    expect(events).toEqual(['before:sendMessage', 'after:sendMessage:200'])
  })

  it('sees errors thrown by the call', async () => {
    const hooks = new HookRegistry()
    let caught: unknown

    hooks.add('onApiCall', async (_ctx, next) => {
      try {
        await next()
      } catch (error) {
        caught = error

        throw error
      }
    })

    const request = vi.fn().mockResolvedValue(fail(400))

    await expect(runRequest(deps({ request }, hooks), 'sendMessage', { chat_id: 1 })).rejects.toMatchObject({ code: 400 })
    expect(caught).toMatchObject({ code: 400 })
  })

  it('runs multiple middlewares outermost-first', async () => {
    const hooks = new HookRegistry()
    const order: string[] = []

    hooks.add('onApiCall', async (_ctx, next) => {
      order.push('a:in')

      await next()

      order.push('a:out')
    })

    hooks.add('onApiCall', async (_ctx, next) => {
      order.push('b:in')

      await next()

      order.push('b:out')
    })

    const request = vi.fn().mockResolvedValue(ok({ message_id: 2 }))

    await runRequest(deps({ request }, hooks), 'sendMessage', { chat_id: 1 })

    expect(order).toEqual(['a:in', 'b:in', 'b:out', 'a:out'])
  })

  it('works with no onApiCall hooks registered', async () => {
    const hooks = new HookRegistry()
    const request = vi.fn().mockResolvedValue(ok({ message_id: 3 }))

    const result = await runRequest(deps({ request }, hooks), 'sendMessage', { chat_id: 1 })

    expect(result).toEqual({ message_id: 3 })
    expect(request).toHaveBeenCalledTimes(1)
  })
})
