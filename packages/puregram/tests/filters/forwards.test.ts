import { describe, expect, it } from 'vitest'

import { forwardOrigin } from '../../src/filters/forwards'

const forwardUpdate = (type: string) => ({
  kind: 'message',
  raw: {
    message_id: 1,
    date: 0,
    chat: { id: 100, type: 'private' },
    forward_origin: { type, date: 0 }
  }
})

describe('forwardOrigin callable + shorthand', () => {
  it('forwardOrigin("user") matches user-origin forwards', () => {
    expect(forwardOrigin('user')(forwardUpdate('user'))).toBe(true)
    expect(forwardOrigin('user')(forwardUpdate('channel'))).toBe(false)
  })

  it('forwardOrigin.user shorthand is identical to callable form', () => {
    expect(forwardOrigin.user(forwardUpdate('user'))).toBe(true)
  })

  it('forwardOrigin.hiddenUser maps to "hidden_user" type', () => {
    expect(forwardOrigin.hiddenUser(forwardUpdate('hidden_user'))).toBe(true)
    expect(forwardOrigin.hiddenUser(forwardUpdate('user'))).toBe(false)
  })

  it('forwardOrigin.chat / .channel match their respective types', () => {
    expect(forwardOrigin.chat(forwardUpdate('chat'))).toBe(true)
    expect(forwardOrigin.channel(forwardUpdate('channel'))).toBe(true)
  })

  it('does not match when forward_origin is absent', () => {
    expect(forwardOrigin('user')({
      kind: 'message',
      raw: { message_id: 1, date: 0, chat: { id: 1, type: 'private' } }
    })).toBe(false)
  })
})
