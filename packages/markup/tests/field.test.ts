import { describe, it, expect } from 'vitest'

import {
  link, textMention, customEmoji, pre, mentionUser, mentionBot
} from '../src/builders/field'

describe('field builders', () => {
  it('link emits text_link with url', () => {
    const f = link('Telegram', 'https://telegram.org')

    expect(f.text).toBe('Telegram')
    expect(f.entities).toEqual([{ type: 'text_link', offset: 0, length: 8, url: 'https://telegram.org' }])
  })

  it('textMention emits text_mention with user', () => {
    const user = { id: 1, is_bot: false, first_name: 'Alice' }
    const f = textMention('Alice', user)

    expect(f.entities).toEqual([{ type: 'text_mention', offset: 0, length: 5, user }])
  })

  it('customEmoji emits custom_emoji with id', () => {
    const f = customEmoji('😎', 'cei_123')

    expect(f.text).toBe('😎')
    expect(f.entities).toEqual([{ type: 'custom_emoji', offset: 0, length: '😎'.length, custom_emoji_id: 'cei_123' }])
  })

  it('pre emits pre with optional language', () => {
    expect(pre('plain').entities).toEqual([{ type: 'pre', offset: 0, length: 5 }])
    expect(pre('code', 'js').entities).toEqual([{ type: 'pre', offset: 0, length: 4, language: 'js' }])
  })

  it('mentionUser synthesizes a user (is_bot: false)', () => {
    const f = mentionUser('alice', 12345)

    expect(f.entities).toEqual([{
      type: 'text_mention',
      offset: 0,
      length: 5,
      user: { id: 12345, first_name: 'alice', is_bot: false }
    }])
  })

  it('mentionBot synthesizes a bot user (is_bot: true)', () => {
    const f = mentionBot('me', 999)

    expect(f.entities[0].user!.is_bot).toBe(true)
    expect(f.entities[0].user!.id).toBe(999)
  })
})
