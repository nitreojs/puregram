import { describe, expect, it } from 'vitest'

import {
  anchor, bold, code, customEmoji, emoji, fnRef, footnoteRef, italic, link, marked, math,
  mention, mentionUser, reference, spoiler, strike, strikethrough, sub, subscript, sup,
  superscript, time, underline
} from '../src/builders/inline'

describe('inline wrappers', () => {
  it('emits a typed text node per wrapper', () => {
    expect(bold('x').emit()).toEqual({ type: 'bold', text: 'x' })
    expect(italic('x').emit()).toEqual({ type: 'italic', text: 'x' })
    expect(underline('x').emit()).toEqual({ type: 'underline', text: 'x' })
    expect(strikethrough('x').emit()).toEqual({ type: 'strikethrough', text: 'x' })
    expect(spoiler('x').emit()).toEqual({ type: 'spoiler', text: 'x' })
    expect(code('x').emit()).toEqual({ type: 'code', text: 'x' })
    expect(marked('x').emit()).toEqual({ type: 'marked', text: 'x' })
    expect(subscript('x').emit()).toEqual({ type: 'subscript', text: 'x' })
    expect(superscript('x').emit()).toEqual({ type: 'superscript', text: 'x' })
  })

  it('nests inline content without touching it', () => {
    expect(bold(['*x*', italic('y')]).emit()).toEqual({
      type: 'bold',
      text: ['*x*', { type: 'italic', text: 'y' }]
    })
  })
})

describe('link / mentionUser', () => {
  it('link emits a url node', () => {
    expect(link('t', 'https://t.me/').emit()).toEqual({ type: 'url', text: 't', url: 'https://t.me/' })
  })

  it('mentionUser stubs the user with defaults', () => {
    expect(mentionUser('u', 42).emit()).toEqual({
      type: 'text_mention',
      text: 'u',
      user: { id: 42, is_bot: false, first_name: '' }
    })
  })

  it('mentionUser carries the optional identity fields', () => {
    expect(mentionUser('u', 42, { firstName: 'A', lastName: 'B', username: 'c', isBot: true }).emit()).toEqual({
      type: 'text_mention',
      text: 'u',
      user: { id: 42, is_bot: true, first_name: 'A', last_name: 'B', username: 'c' }
    })
  })
})

describe('math / customEmoji / time', () => {
  it('math emits a mathematical expression', () => {
    expect(math('E=mc^2').emit()).toEqual({ type: 'mathematical_expression', expression: 'E=mc^2' })
  })

  it('customEmoji carries the id and alternative text', () => {
    expect(customEmoji('555', '🔥').emit()).toEqual({
      type: 'custom_emoji',
      custom_emoji_id: '555',
      alternative_text: '🔥'
    })
  })

  it('time defaults the format to an empty string', () => {
    expect(time('22:45', 1647531900).emit()).toEqual({
      type: 'date_time',
      text: '22:45',
      unix_time: 1647531900,
      date_time_format: ''
    })
    expect(time('22:45', 1647531900, 'wDT').emit()).toEqual({
      type: 'date_time',
      text: '22:45',
      unix_time: 1647531900,
      date_time_format: 'wDT'
    })
  })
})

describe('reference / anchor / footnoteRef', () => {
  it('reference emits an anchor link', () => {
    expect(reference('see', 'note-1').emit()).toEqual({ type: 'anchor_link', text: 'see', anchor_name: 'note-1' })
  })

  it('anchor emits a named target', () => {
    expect(anchor('chapter-1').emit()).toEqual({ type: 'anchor', name: 'chapter-1' })
  })

  it('footnoteRef defaults the label to the id', () => {
    expect(footnoteRef('1').emit()).toEqual({ type: 'reference_link', text: '1', reference_name: '1' })
    expect(footnoteRef('1', bold('see')).emit()).toEqual({
      type: 'reference_link',
      text: { type: 'bold', text: 'see' },
      reference_name: '1'
    })
  })
})

describe('aliases', () => {
  it('re-point at the originals', () => {
    expect(strike).toBe(strikethrough)
    expect(sub).toBe(subscript)
    expect(sup).toBe(superscript)
    expect(mention).toBe(mentionUser)
    expect(emoji).toBe(customEmoji)
    expect(fnRef).toBe(footnoteRef)
  })
})
