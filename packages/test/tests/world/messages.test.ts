import { Telegram } from 'puregram'
import { afterEach, describe, expect, it } from 'vitest'

import { createTestEnv } from '../../src'

describe('world: messages', () => {
  let cleanup: (() => Promise<void>) | undefined

  afterEach(async () => {
    await cleanup?.()
    cleanup = undefined
  })

  it('bot sendMessage appends to chat history', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()

    await tg.api.sendMessage({ chat_id: alice.pmChat.id, text: 'hi' })

    expect(alice.pmChat.messages).toHaveLength(1)

    const first = alice.pmChat.messages[0]

    expect(first?.text).toBe('hi')
    expect(first?.from).toBeUndefined()
  })

  it('lastBotMessage / lastUserMessage / lastMessage', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    tg.onMessage(async (u) => {
      await tg.api.sendMessage({ chat_id: u.chat.id, text: 'reply' })
    })

    const alice = env.createUser()

    await alice.sendMessage('hi')

    expect(alice.pmChat.messages.map(m => m.text)).toEqual(['hi', 'reply'])
    expect(alice.pmChat.lastMessage?.text).toBe('reply')
    expect(alice.pmChat.lastBotMessage?.text).toBe('reply')
    expect(alice.pmChat.lastUserMessage?.text).toBe('hi')
  })

  it('editMessageText mutates text in-place', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()
    const sent = await tg.api.sendMessage({ chat_id: alice.pmChat.id, text: 'old' }) as { message_id: number }

    await tg.api.editMessageText({ chat_id: alice.pmChat.id, message_id: sent.message_id, text: 'new' })

    expect(alice.pmChat.messages[0]?.text).toBe('new')
  })

  it('editMessageCaption mutates caption in-place', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()
    const sent = await tg.api.sendPhoto({ chat_id: alice.pmChat.id, photo: 'stub-file-id', caption: 'old caption' }) as { message_id: number }

    await tg.api.editMessageCaption({ chat_id: alice.pmChat.id, message_id: sent.message_id, caption: 'new caption' })

    expect(alice.pmChat.messages[0]?.caption).toBe('new caption')
  })

  it('deleteMessage marks isDeleted and removes from history', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()
    const sent = await tg.api.sendMessage({ chat_id: alice.pmChat.id, text: 'x' }) as { message_id: number }

    await tg.api.deleteMessage({ chat_id: alice.pmChat.id, message_id: sent.message_id })

    expect(alice.pmChat.messages).toHaveLength(0)
  })

  it('deleteMessages removes a batch', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()
    const a = await tg.api.sendMessage({ chat_id: alice.pmChat.id, text: 'a' }) as { message_id: number }
    const b = await tg.api.sendMessage({ chat_id: alice.pmChat.id, text: 'b' }) as { message_id: number }

    await tg.api.deleteMessages({ chat_id: alice.pmChat.id, message_ids: [a.message_id, b.message_id] })

    expect(alice.pmChat.messages).toHaveLength(0)
  })

  it('forwardMessage creates a copy in destination chat with forward_origin', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()
    const group = env.createChat({ type: 'group', title: 'g' })
    const sent = await tg.api.sendMessage({ chat_id: alice.pmChat.id, text: 'orig' }) as { message_id: number }

    const forwarded = await tg.api.forwardMessage({
      chat_id: group.id,
      from_chat_id: alice.pmChat.id,
      message_id: sent.message_id
    }) as { message_id: number, forward_origin: unknown }

    expect(group.messages).toHaveLength(1)
    expect(forwarded.forward_origin).toBeDefined()
    expect(group.messages[0]?.text).toBe('orig')
  })

  it('copyMessage creates a copy without forward_origin', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()
    const group = env.createChat({ type: 'group', title: 'g' })
    const sent = await tg.api.sendMessage({ chat_id: alice.pmChat.id, text: 'orig' }) as { message_id: number }

    const copied = await tg.api.copyMessage({
      chat_id: group.id,
      from_chat_id: alice.pmChat.id,
      message_id: sent.message_id
    }) as { message_id: number, forward_origin?: unknown }

    expect(group.messages).toHaveLength(1)
    expect(copied.forward_origin).toBeUndefined()
    expect(group.messages[0]?.text).toBe('orig')
  })

  it('editMessageReplyMarkup updates reply_markup on the stored message', async () => {
    const tg = new Telegram({ token: 'TEST', apiBaseUrl: 'http://unused/bot' })
    const env = createTestEnv(tg)

    cleanup = () => env.shutdown()

    const alice = env.createUser()
    const sent = await tg.api.sendMessage({ chat_id: alice.pmChat.id, text: 'hi' }) as { message_id: number }
    const markup = { inline_keyboard: [[{ text: 'click', callback_data: 'x' }]] }

    await tg.api.editMessageReplyMarkup({
      chat_id: alice.pmChat.id,
      message_id: sent.message_id,
      reply_markup: markup
    })

    expect(alice.pmChat.messages[0]?.toRaw().reply_markup).toEqual(markup)
  })
})
