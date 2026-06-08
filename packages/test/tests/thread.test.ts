import { Telegram } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { createTestEnv } from '../src'

const topicMessage = (overrides: Record<string, unknown> = {}) => ({
  message: {
    message_id: 100,
    date: 0,
    chat: { id: 555, type: 'supergroup', title: 'forum' },
    from: { id: 7, is_bot: false, first_name: 'Alice' },
    text: 'hi',
    message_thread_id: 42,
    is_topic_message: true,
    ...overrides
  }
})

describe('update.thread', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('injects message_thread_id and chat_id on thread shortcuts', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    tg.onMessage(async (u) => {
      await u.thread?.send('echo')
    })

    await env.inject(topicMessage())

    expect(env.callsTo('sendMessage')).toHaveLength(1)
    expect(env.lastApiCall('sendMessage')?.params).toMatchObject({
      chat_id: 555,
      message_thread_id: 42,
      text: 'echo'
    })
  })

  it('injects the thread id on non-send methods too', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    tg.onMessage(async (u) => {
      await u.thread?.sendChatAction('typing')
    })

    await env.inject(topicMessage())

    expect(env.lastApiCall('sendChatAction')?.params).toMatchObject({
      chat_id: 555,
      message_thread_id: 42,
      action: 'typing'
    })
  })

  it('reply twin fills message_thread_id and reply_parameters.message_id', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    tg.onMessage(async (u) => {
      await u.thread?.reply('r')
    })

    await env.inject(topicMessage())

    expect(env.lastApiCall('sendMessage')?.params).toMatchObject({
      message_thread_id: 42,
      reply_parameters: { message_id: 100 }
    })
  })

  it('thread is undefined for a non-thread message', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    let observed: unknown = 'unset'

    tg.onMessage((u) => {
      observed = u.thread
    })

    await env.inject({
      message: {
        message_id: 1,
        date: 0,
        chat: { id: 1, type: 'private' },
        from: { id: 1, is_bot: false, first_name: 'A' },
        text: 'plain'
      }
    })

    expect(observed).toBeUndefined()
  })
})
