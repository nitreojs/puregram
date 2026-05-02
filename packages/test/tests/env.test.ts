import { Telegram } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { apiError, createTestEnv } from '../src'

describe('TestEnv (skeleton)', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('records api calls with structured params', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    env.onApi('sendMessage', { message_id: 1, date: 0, chat: { id: 1, type: 'private' }, text: 'forced' })

    await tg.api.sendMessage({ chat_id: 1, text: 'hi' })

    expect(env.apiCalls).toHaveLength(1)

    const call = env.lastApiCall()

    expect(call?.method).toBe('sendMessage')
    expect(call?.params).toEqual({ chat_id: 1, text: 'hi' })
    expect(call?.result).toMatchObject({ message_id: 1 })
  })

  it('lastApiCall(method) filters', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    env.onApi('sendMessage', [
      { message_id: 1, date: 0, chat: { id: 1, type: 'private' }, text: 'a' },
      { message_id: 2, date: 0, chat: { id: 1, type: 'private' }, text: 'b' }
    ])

    await tg.api.sendMessage({ chat_id: 1, text: 'first' })
    await tg.api.sendMessage({ chat_id: 1, text: 'second' })

    expect(env.lastApiCall('sendMessage')!.params.text).toBe('second')
    expect(env.callsTo('sendMessage')).toHaveLength(2)
  })

  it('clearApiCalls empties the log but keeps overrides', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    env.onApi('sendMessage', { message_id: 1, date: 0, chat: { id: 1, type: 'private' }, text: 'a' })

    await tg.api.sendMessage({ chat_id: 1, text: 'first' })
    env.clearApiCalls()
    expect(env.apiCalls).toHaveLength(0)

    await tg.api.sendMessage({ chat_id: 1, text: 'second' })
    expect(env.apiCalls).toHaveLength(1)
  })

  it('apiError causes ApiError throw without suppress', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    env.onApi('sendMessage', apiError(403, 'Forbidden'))

    await expect(tg.api.sendMessage({ chat_id: 1, text: 'x' })).rejects.toThrow(/Forbidden/)
  })

  it('apiError + suppress returns ApiResponseError', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    env.onApi('sendMessage', apiError(403, 'Forbidden'))

    const r = await tg.api.sendMessage({ chat_id: 1, text: 'x', suppress: true })

    expect(Telegram.isErrorResponse(r)).toBe(true)
  })

  it('shutdown restores http client and runs onShutdown', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    let shutdownFired = 0

    tg.useHook('onShutdown', () => {
      shutdownFired += 1
    })

    const env = createTestEnv(tg)

    await env.shutdown()
    expect(shutdownFired).toBe(1)
  })
})
