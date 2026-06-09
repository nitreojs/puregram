import { Telegram } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { createTestEnv } from '../src'

describe('business_connection_id autofill', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('fills business_connection_id (and reply params) when replying to a business message', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    tg.onBusinessMessage(message => message.reply('on the connection'))

    await env.inject({
      business_message: {
        message_id: 5,
        date: 0,
        chat: { id: 900, type: 'private' },
        from: { id: 3, is_bot: false, first_name: 'Biz' },
        text: 'hi',
        business_connection_id: 'biz_abc'
      }
    })

    expect(env.lastApiCall('sendMessage')?.params).toMatchObject({
      chat_id: 900,
      business_connection_id: 'biz_abc',
      reply_parameters: { message_id: 5 }
    })
  })

  it('omits business_connection_id on a regular (non-business) message', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    tg.onMessage(message => message.reply('regular'))

    await env.inject({
      message: {
        message_id: 1,
        date: 0,
        chat: { id: 1, type: 'private' },
        from: { id: 1, is_bot: false, first_name: 'A' },
        text: 'hi'
      }
    })

    const params = env.lastApiCall('sendMessage')?.params ?? {}

    expect('business_connection_id' in params).toBe(false)
  })
})
