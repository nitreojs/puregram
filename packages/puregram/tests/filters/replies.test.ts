import { describe, expect, it } from 'vitest'

import { hasReply, replyTo } from '../../src/filters/replies'

const messageWithReply = (replyId: number) => ({
  kind: 'message',
  raw: {
    message_id: 10,
    date: 0,
    chat: { id: 1, type: 'private' },
    text: 'thanks',
    reply_to_message: { message_id: replyId, date: 0, chat: { id: 1, type: 'private' } }
  }
})

const messageNoReply = () => ({
  kind: 'message',
  raw: {
    message_id: 10,
    date: 0,
    chat: { id: 1, type: 'private' },
    text: 'hi'
  }
})

describe('hasReply', () => {
  it('matches when reply_to_message is set', () => {
    expect(hasReply(messageWithReply(5))).toBe(true)
  })

  it('does not match when reply_to_message is absent', () => {
    expect(hasReply(messageNoReply())).toBe(false)
  })

  it('limits scope via kinds metadata', () => {
    expect(hasReply.kinds).toContain('message')
    expect(hasReply.kinds).toContain('business_message')
    expect(hasReply.kinds).not.toContain('callback_query')
  })
})

describe('replyTo', () => {
  it('matches the specified message_id', () => {
    expect(replyTo(5)(messageWithReply(5))).toBe(true)
    expect(replyTo(7)(messageWithReply(5))).toBe(false)
  })

  it('does not match when reply_to_message is absent', () => {
    expect(replyTo(5)(messageNoReply())).toBe(false)
  })

  it('encodes the target id in its name', () => {
    expect(replyTo(42).name).toBe('replyTo(42)')
  })
})
