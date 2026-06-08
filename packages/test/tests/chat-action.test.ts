import { Telegram } from 'puregram'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createTestEnv } from '../src'

describe('chat action controller', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('tg.withChatAction sends the action and returns the callback result', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const result = await tg.withChatAction(555, 'typing', () => 'done')

    expect(result).toBe('done')

    // the action is fire-and-forget — wait for the first send to land
    await vi.waitFor(() => {
      expect(env.callsTo('sendChatAction').length).toBeGreaterThanOrEqual(1)
    })

    expect(env.lastApiCall('sendChatAction')?.params).toMatchObject({ chat_id: 555, action: 'typing' })
  })

  it('tg.withChatAction rethrows and still stops when the callback throws', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    await expect(
      tg.withChatAction(555, 'typing', () => {
        throw new Error('boom')
      })
    ).rejects.toThrow('boom')
  })

  it('update.createActionController fills chat_id from the update', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    tg.onMessage((message) => {
      const controller = message.createActionController('typing')

      controller.start()
      controller.stop()
    })

    await env.inject({
      message: {
        message_id: 1,
        date: 0,
        chat: { id: 777, type: 'private' },
        from: { id: 1, is_bot: false, first_name: 'A' },
        text: 'hi'
      }
    })

    await vi.waitFor(() => {
      expect(env.callsTo('sendChatAction').length).toBeGreaterThanOrEqual(1)
    })

    expect(env.lastApiCall('sendChatAction')?.params).toMatchObject({ chat_id: 777, action: 'typing' })
  })
})
