import { describe, expect, it } from 'vitest'

import { deepLink } from '../src/deep-link'
import { parseDeepLink } from '../src/parse-deep-link'

describe('parseDeepLink — profiles', () => {
  it('parses a bare username link', () => {
    expect(parseDeepLink('https://t.me/durov')).toEqual({ type: 'profile', username: 'durov' })
  })

  it('accepts links without a scheme', () => {
    expect(parseDeepLink('t.me/durov')).toEqual({ type: 'profile', username: 'durov' })
  })

  it('accepts the telegram.me / telegram.dog domains and strips www', () => {
    expect(parseDeepLink('https://telegram.me/durov')).toEqual({ type: 'profile', username: 'durov' })
    expect(parseDeepLink('https://telegram.dog/durov')).toEqual({ type: 'profile', username: 'durov' })
    expect(parseDeepLink('https://www.t.me/durov')).toEqual({ type: 'profile', username: 'durov' })
  })
})

describe('parseDeepLink — message links', () => {
  it('parses a public message link', () => {
    expect(parseDeepLink('https://t.me/durov/123')).toEqual({
      type: 'message',
      chat: { username: 'durov' },
      messageId: 123
    })
  })

  it('parses a public forum-topic message link', () => {
    expect(parseDeepLink('https://t.me/some_channel/12/345')).toEqual({
      type: 'message',
      chat: { username: 'some_channel' },
      threadId: 12,
      messageId: 345
    })
  })

  it('reads ?comment= and ?thread= query forms', () => {
    expect(parseDeepLink('https://t.me/durov/123?comment=99')).toEqual({
      type: 'message',
      chat: { username: 'durov' },
      messageId: 123,
      commentId: 99
    })
    expect(parseDeepLink('https://t.me/durov/123?thread=5')).toEqual({
      type: 'message',
      chat: { username: 'durov' },
      messageId: 123,
      threadId: 5
    })
  })

  it('resolves a private c/ link to its bot api -100 id', () => {
    expect(parseDeepLink('t.me/c/1380524958/187')).toEqual({
      type: 'message',
      chat: { id: -1001380524958 },
      messageId: 187
    })
  })

  it('resolves a private c/ forum-topic link', () => {
    expect(parseDeepLink('t.me/c/1380524958/12/187')).toEqual({
      type: 'message',
      chat: { id: -1001380524958 },
      threadId: 12,
      messageId: 187
    })
  })

  it('rejects a private c/ link without a message id', () => {
    expect(parseDeepLink('t.me/c/1380524958')).toBeUndefined()
  })
})

describe('parseDeepLink — bot actions', () => {
  it('parses a start payload', () => {
    expect(parseDeepLink('https://t.me/my_bot?start=ref_42')).toEqual({
      type: 'bot-start',
      bot: 'my_bot',
      payload: 'ref_42'
    })
  })

  it('drops an empty start payload', () => {
    expect(parseDeepLink('https://t.me/my_bot?start=')).toEqual({ type: 'bot-start', bot: 'my_bot' })
  })

  it('parses startgroup with payload and admin rights', () => {
    expect(parseDeepLink('https://t.me/my_bot?startgroup=inv&admin=post_messages+edit_messages')).toEqual({
      type: 'group-start',
      bot: 'my_bot',
      payload: 'inv',
      admin: ['post_messages', 'edit_messages']
    })
  })

  it('parses a bare startgroup', () => {
    expect(parseDeepLink('https://t.me/my_bot?startgroup')).toEqual({ type: 'group-start', bot: 'my_bot' })
  })

  it('parses startchannel with admin rights', () => {
    expect(parseDeepLink('https://t.me/my_bot?startchannel&admin=post_messages')).toEqual({
      type: 'channel-start',
      bot: 'my_bot',
      admin: ['post_messages']
    })
  })

  it('parses startattach with a choose filter', () => {
    expect(parseDeepLink('https://t.me/my_bot?startattach=pl&choose=users+bots')).toEqual({
      type: 'attach',
      bot: 'my_bot',
      payload: 'pl',
      choose: ['users', 'bots']
    })
  })

  it('parses a game link', () => {
    expect(parseDeepLink('https://t.me/my_bot?game=my_game')).toEqual({
      type: 'game',
      bot: 'my_bot',
      name: 'my_game'
    })
  })
})

describe('parseDeepLink — mini-apps', () => {
  it('parses a named mini-app with payload and mode', () => {
    expect(parseDeepLink('https://t.me/my_bot/tictactoe?startapp=room_7&mode=fullscreen')).toEqual({
      type: 'mini-app',
      bot: 'my_bot',
      app: 'tictactoe',
      payload: 'room_7',
      mode: 'fullscreen'
    })
  })

  it('parses the main mini-app with a bare startapp', () => {
    expect(parseDeepLink('https://t.me/my_bot?startapp')).toEqual({ type: 'mini-app', bot: 'my_bot' })
  })

  it('treats a non-numeric second segment as a named mini-app', () => {
    expect(parseDeepLink('https://t.me/my_bot/some_app')).toEqual({
      type: 'mini-app',
      bot: 'my_bot',
      app: 'some_app'
    })
  })

  it('ignores an unknown mode value', () => {
    expect(parseDeepLink('https://t.me/my_bot?startapp=x&mode=weird')).toEqual({
      type: 'mini-app',
      bot: 'my_bot',
      payload: 'x'
    })
  })
})

describe('parseDeepLink — video chats, shares, sets, invites', () => {
  it('parses a video chat link', () => {
    expect(parseDeepLink('https://t.me/durov?videochat')).toEqual({
      type: 'video-chat',
      username: 'durov',
      live: false
    })
  })

  it('parses a livestream link with a hash', () => {
    expect(parseDeepLink('https://t.me/durov?livestream=abc')).toEqual({
      type: 'video-chat',
      username: 'durov',
      live: true,
      hash: 'abc'
    })
  })

  it('parses a share link and decodes the url', () => {
    expect(parseDeepLink('https://t.me/share?url=https%3A%2F%2Fexample.com&text=hi')).toEqual({
      type: 'share',
      url: 'https://example.com',
      text: 'hi'
    })
    expect(parseDeepLink('https://t.me/share/url?url=https%3A%2F%2Fx.com')).toEqual({
      type: 'share',
      url: 'https://x.com'
    })
  })

  it('parses sticker-set and emoji-set links', () => {
    expect(parseDeepLink('https://t.me/addstickers/Animals')).toEqual({ type: 'sticker-set', name: 'Animals' })
    expect(parseDeepLink('https://t.me/addemoji/MyEmoji')).toEqual({ type: 'emoji-set', name: 'MyEmoji' })
  })

  it('parses joinchat and + invite links', () => {
    expect(parseDeepLink('https://t.me/joinchat/AAAAAEHbDxyz')).toEqual({ type: 'invite', hash: 'AAAAAEHbDxyz' })
    expect(parseDeepLink('https://t.me/+AbCdEf123')).toEqual({ type: 'invite', hash: 'AbCdEf123' })
  })
})

describe('parseDeepLink — rejections', () => {
  it('rejects empty and whitespace input', () => {
    expect(parseDeepLink('')).toBeUndefined()
    expect(parseDeepLink('   ')).toBeUndefined()
  })

  it('rejects non-telegram hosts', () => {
    expect(parseDeepLink('https://example.com/durov')).toBeUndefined()
  })

  it('rejects reserved feature paths it does not model', () => {
    expect(parseDeepLink('https://t.me/proxy?server=1.2.3.4')).toBeUndefined()
  })

  it('rejects unparseable input', () => {
    expect(parseDeepLink('not a url at all !!!')).toBeUndefined()
  })

  it('rejects a bare domain and too-short usernames', () => {
    expect(parseDeepLink('https://t.me/')).toBeUndefined()
    expect(parseDeepLink('https://t.me/ab')).toBeUndefined()
  })
})

describe('parseDeepLink — inverts deepLink builders', () => {
  it('round-trips a start payload link', () => {
    expect(parseDeepLink(deepLink.start({ bot: 'my_bot', payload: 'ref_42' }))).toEqual({
      type: 'bot-start',
      bot: 'my_bot',
      payload: 'ref_42'
    })
  })

  it('round-trips a named mini-app link', () => {
    const link = deepLink.startApp({ bot: 'my_bot', app: 'tictactoe', payload: 'room_7', mode: 'fullscreen' })

    expect(parseDeepLink(link)).toEqual({
      type: 'mini-app',
      bot: 'my_bot',
      app: 'tictactoe',
      payload: 'room_7',
      mode: 'fullscreen'
    })
  })

  it('round-trips a startchannel link', () => {
    const link = deepLink.startChannel({ bot: 'my_bot', admin: ['post_messages', 'edit_messages'] })

    expect(parseDeepLink(link)).toEqual({
      type: 'channel-start',
      bot: 'my_bot',
      admin: ['post_messages', 'edit_messages']
    })
  })
})
