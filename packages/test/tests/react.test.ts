import { Telegram } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { createTestEnv } from '../src'

const plainMessage = {
  message: {
    message_id: 7,
    date: 0,
    chat: { id: 5, type: 'private' },
    from: { id: 1, is_bot: false, first_name: 'A' },
    text: 'hi'
  }
}

describe('update.react', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('reacts with a single emoji string', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    tg.onMessage(message => message.react('👍'))

    await env.inject(plainMessage)

    expect(env.lastApiCall('setMessageReaction')?.params).toMatchObject({
      chat_id: 5,
      message_id: 7,
      reaction: [{ type: 'emoji', emoji: '👍' }]
    })
  })

  it('passes a reaction array (and extra params) through unchanged', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    tg.onMessage(message => message.react([{ type: 'emoji', emoji: '🔥' }], { is_big: true }))

    await env.inject(plainMessage)

    expect(env.lastApiCall('setMessageReaction')?.params).toMatchObject({
      reaction: [{ type: 'emoji', emoji: '🔥' }],
      is_big: true
    })
  })
})
