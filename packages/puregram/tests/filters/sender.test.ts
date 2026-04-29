import { describe, expect, it } from 'vitest'

import { anonymous, from, fromBot, fromPremium, viaBot } from '../../src/filters/sender'

const messageWith = (
  fromExtra: Record<string, unknown> = {},
  rawExtra: Record<string, unknown> = {}
) => ({
  kind: 'message',
  raw: {
    message_id: 1,
    date: 0,
    chat: { id: 100, type: 'private' },
    from: { id: 1, is_bot: false, first_name: 'a', ...fromExtra },
    ...rawExtra
  }
})

describe('from', () => {
  it('matches when from.id is one of the supplied ids', () => {
    expect(from(123, 456)(messageWith({ id: 123 }))).toBe(true)
    expect(from(123, 456)(messageWith({ id: 456 }))).toBe(true)
    expect(from(123, 456)(messageWith({ id: 999 }))).toBe(false)
  })

  it('array form behaves identically to varargs', () => {
    expect(from([123, 456])(messageWith({ id: 123 }))).toBe(true)
    expect(from([123, 456])(messageWith({ id: 999 }))).toBe(false)
  })
})

describe('fromBot / fromPremium', () => {
  it('fromBot matches when from.is_bot is true', () => {
    expect(fromBot(messageWith({ is_bot: true }))).toBe(true)
    expect(fromBot(messageWith({ is_bot: false }))).toBe(false)
  })

  it('fromPremium matches when from.is_premium is true', () => {
    expect(fromPremium(messageWith({ is_premium: true }))).toBe(true)
    expect(fromPremium(messageWith({}))).toBe(false)
  })
})

describe('viaBot', () => {
  it('matches when via_bot is set on the message payload', () => {
    expect(viaBot(messageWith({}, { via_bot: { id: 42, is_bot: true, first_name: 'inline' } }))).toBe(true)
    expect(viaBot(messageWith())).toBe(false)
  })
})

describe('anonymous', () => {
  it('matches when from.id equals chat.id', () => {
    const update = {
      kind: 'message',
      raw: {
        message_id: 1,
        date: 0,
        chat: { id: 555, type: 'supergroup' },
        from: { id: 555, is_bot: false, first_name: 'group' }
      }
    }

    expect(anonymous(update)).toBe(true)
  })

  it('does not match when ids differ', () => {
    expect(anonymous(messageWith({ id: 1 }, {}))).toBe(false)
  })
})
