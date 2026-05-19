import { describe, expect, it } from 'vitest'

import { deepLink } from '../src/deep-link'

describe('deepLink', () => {
  it('returns just the base url when no payload is supplied', () => {
    expect(deepLink({ bot: 'my_bot' })).toBe('https://t.me/my_bot')
  })

  it('renders a start payload', () => {
    expect(deepLink({ bot: 'my_bot', start: 'ref_42' })).toBe('https://t.me/my_bot?start=ref_42')
  })

  it('renders a startgroup payload', () => {
    expect(deepLink({ bot: 'my_bot', startgroup: 'invite' })).toBe('https://t.me/my_bot?startgroup=invite')
  })

  it('renders a startchannel without admin rights', () => {
    expect(deepLink({ bot: 'my_bot', startchannel: true })).toBe('https://t.me/my_bot?startchannel')
  })

  it('renders a startchannel with admin rights joined by +', () => {
    expect(deepLink({
      bot: 'my_bot',
      startchannel: true,
      admin: ['post_messages', 'edit_messages']
    })).toBe('https://t.me/my_bot?startchannel&admin=post_messages+edit_messages')
  })

  it('renders a startapp payload', () => {
    expect(deepLink({ bot: 'my_bot', startapp: 'page_42' })).toBe('https://t.me/my_bot?startapp=page_42')
  })

  it('url-encodes special characters in the payload', () => {
    expect(deepLink({ bot: 'my_bot', start: 'user@id 42' })).toBe('https://t.me/my_bot?start=user%40id%2042')
  })

  it('url-encodes admin right tokens with reserved chars', () => {
    expect(deepLink({
      bot: 'my_bot',
      startchannel: true,
      admin: ['post messages', 'change&info']
    })).toBe('https://t.me/my_bot?startchannel&admin=post%20messages+change%26info')
  })

  it('first defined payload wins when multiple are provided', () => {
    expect(deepLink({ bot: 'my_bot', start: 'a', startgroup: 'b' })).toBe('https://t.me/my_bot?start=a')
    expect(deepLink({ bot: 'my_bot', startgroup: 'b', startchannel: true })).toBe('https://t.me/my_bot?startgroup=b')
  })

  it('ignores empty admin array on startchannel', () => {
    expect(deepLink({ bot: 'my_bot', startchannel: true, admin: [] })).toBe('https://t.me/my_bot?startchannel')
  })
})
