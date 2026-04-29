import { describe, expect, it } from 'vitest'

import { chat, chatId, forum, senderChat, topicMessage } from '../../src/filters/chat'

const messageWith = (rawExtra: Record<string, unknown> = {}, chatExtra: Record<string, unknown> = {}) => ({
  kind: 'message',
  raw: {
    message_id: 1,
    date: 0,
    chat: { id: 100, type: 'private', ...chatExtra },
    ...rawExtra
  }
})

describe('chat callable + shorthand', () => {
  it('chat("private") matches private chats', () => {
    expect(chat('private')(messageWith())).toBe(true)
    expect(chat('private')(messageWith({}, { type: 'group' }))).toBe(false)
  })

  it('chat.private matches private chats identical to callable form', () => {
    expect(chat.private(messageWith())).toBe(true)
    expect(chat.private(messageWith({}, { type: 'group' }))).toBe(false)
  })

  it('chat.group / supergroup / channel match their respective types', () => {
    expect(chat.group(messageWith({}, { type: 'group' }))).toBe(true)
    expect(chat.supergroup(messageWith({}, { type: 'supergroup' }))).toBe(true)
    expect(chat.channel(messageWith({}, { type: 'channel' }))).toBe(true)
  })
})

describe('chatId', () => {
  it('varargs match any of the supplied ids', () => {
    expect(chatId(123, 456)(messageWith({}, { id: 123 }))).toBe(true)
    expect(chatId(123, 456)(messageWith({}, { id: 456 }))).toBe(true)
    expect(chatId(123, 456)(messageWith({}, { id: 999 }))).toBe(false)
  })

  it('array form matches any of the supplied ids', () => {
    expect(chatId([123, 456])(messageWith({}, { id: 123 }))).toBe(true)
    expect(chatId([123, 456])(messageWith({}, { id: 456 }))).toBe(true)
    expect(chatId([123, 456])(messageWith({}, { id: 999 }))).toBe(false)
  })
})

describe('forum / topicMessage', () => {
  it('forum matches when chat.is_forum is true', () => {
    expect(forum(messageWith({}, { is_forum: true }))).toBe(true)
    expect(forum(messageWith({}, { is_forum: false }))).toBe(false)
    expect(forum(messageWith())).toBe(false)
  })

  it('topicMessage matches when is_topic_message is true', () => {
    expect(topicMessage(messageWith({ is_topic_message: true }))).toBe(true)
    expect(topicMessage(messageWith({ is_topic_message: false }))).toBe(false)
    expect(topicMessage(messageWith())).toBe(false)
  })
})

describe('senderChat callable + shorthand', () => {
  const senderChatUpdate = (type: string) => ({
    kind: 'message',
    raw: {
      message_id: 1,
      date: 0,
      chat: { id: 100, type: 'supergroup' },
      sender_chat: { id: 200, type }
    }
  })

  it('senderChat("channel") matches channel sender chats', () => {
    expect(senderChat('channel')(senderChatUpdate('channel'))).toBe(true)
    expect(senderChat('channel')(senderChatUpdate('group'))).toBe(false)
  })

  it('senderChat.channel shorthand is identical to callable form', () => {
    expect(senderChat.channel(senderChatUpdate('channel'))).toBe(true)
    expect(senderChat.group(senderChatUpdate('group'))).toBe(true)
    expect(senderChat.supergroup(senderChatUpdate('supergroup'))).toBe(true)
  })
})
