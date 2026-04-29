import { describe, expect, it } from 'vitest'

import { chatMember, chatMemberSelf } from '../../src/filters/chat-member'

const transition = (oldStatus: string, newStatus: string, userId = 1) => ({
  kind: 'chat_member',
  raw: {
    chat: { id: 1, type: 'supergroup' },
    from: { id: 99, is_bot: false, first_name: 'admin' },
    date: 0,
    old_chat_member: {
      status: oldStatus,
      user: { id: userId, is_bot: false, first_name: 'u' }
    },
    new_chat_member: {
      status: newStatus,
      user: { id: userId, is_bot: false, first_name: 'u' }
    }
  }
})

describe('chatMember status transitions', () => {
  it('joined: outside (left/kicked) -> inside', () => {
    expect(chatMember('joined')(transition('left', 'member'))).toBe(true)
    expect(chatMember('joined')(transition('kicked', 'member'))).toBe(true)
    expect(chatMember('joined')(transition('member', 'administrator'))).toBe(false)
  })

  it('left: inside -> outside', () => {
    expect(chatMember('left')(transition('member', 'left'))).toBe(true)
    expect(chatMember('left')(transition('member', 'kicked'))).toBe(true)
    expect(chatMember('left')(transition('left', 'member'))).toBe(false)
  })

  it('promoted: non-elevated -> elevated', () => {
    expect(chatMember('promoted')(transition('member', 'administrator'))).toBe(true)
    expect(chatMember('promoted')(transition('member', 'creator'))).toBe(true)
    expect(chatMember('promoted')(transition('administrator', 'member'))).toBe(false)
  })

  it('demoted: elevated -> non-elevated', () => {
    expect(chatMember('demoted')(transition('administrator', 'member'))).toBe(true)
    expect(chatMember('demoted')(transition('creator', 'member'))).toBe(true)
    expect(chatMember('demoted')(transition('member', 'administrator'))).toBe(false)
  })

  it('banned: anything -> kicked', () => {
    expect(chatMember('banned')(transition('member', 'kicked'))).toBe(true)
    expect(chatMember('banned')(transition('left', 'kicked'))).toBe(true)
    expect(chatMember('banned')(transition('kicked', 'kicked'))).toBe(false)
  })

  it('unbanned: kicked -> anything else', () => {
    expect(chatMember('unbanned')(transition('kicked', 'member'))).toBe(true)
    expect(chatMember('unbanned')(transition('kicked', 'left'))).toBe(true)
    expect(chatMember('unbanned')(transition('member', 'left'))).toBe(false)
  })

  it('chatMember.banned shorthand is identical to callable form', () => {
    expect(chatMember.banned(transition('member', 'kicked'))).toBe(true)
    expect(chatMember.banned(transition('member', 'member'))).toBe(false)
  })

  it('returns false when statuses are missing', () => {
    expect(chatMember('joined')({ kind: 'chat_member', raw: {} })).toBe(false)
  })
})

describe('chatMemberSelf', () => {
  it('matches when new_chat_member.user.id equals the bot id', () => {
    expect(chatMemberSelf(42)(transition('left', 'member', 42))).toBe(true)
  })

  it('matches when from.id equals the bot id', () => {
    const update = {
      kind: 'chat_member',
      raw: {
        chat: { id: 1, type: 'supergroup' },
        from: { id: 42, is_bot: true, first_name: 'bot' },
        date: 0,
        old_chat_member: { status: 'left', user: { id: 1, is_bot: false, first_name: 'x' } },
        new_chat_member: { status: 'member', user: { id: 1, is_bot: false, first_name: 'x' } }
      }
    }

    expect(chatMemberSelf(42)(update)).toBe(true)
  })

  it('does not match when neither id matches', () => {
    expect(chatMemberSelf(42)(transition('left', 'member', 1))).toBe(false)
  })
})
