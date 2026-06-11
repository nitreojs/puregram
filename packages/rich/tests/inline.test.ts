// packages/rich/tests/inline.test.ts
import { describe, expect, it } from 'vitest'

import {
  bold, italic, underline, strikethrough, spoiler, code, marked,
  subscript, superscript, link, mentionUser, math, customEmoji, time, reference, anchor
} from '../src/builders/inline'

const md = (n: { render: (d: 'markdown' | 'html') => string }) => n.render('markdown')
const html = (n: { render: (d: 'markdown' | 'html') => string }) => n.render('html')

describe('inline builders', () => {
  it('renders simple wrappers in both dialects', () => {
    expect(md(bold('x'))).toBe('**x**')
    expect(html(bold('x'))).toBe('<b>x</b>')
    expect(md(italic('x'))).toBe('*x*')
    expect(md(strikethrough('x'))).toBe('~~x~~')
    expect(md(spoiler('x'))).toBe('||x||')
    expect(md(code('x'))).toBe('`x`')
    expect(md(marked('x'))).toBe('==x==')
  })

  it('uses html fallback for tokens markdown lacks', () => {
    expect(md(underline('x'))).toBe('<u>x</u>')
    expect(md(subscript('x'))).toBe('<sub>x</sub>')
    expect(md(superscript('x'))).toBe('<sup>x</sup>')
  })

  it('escapes nested string content', () => {
    expect(md(bold('*x*'))).toBe('**\\*x\\***')
    expect(html(bold('<x>'))).toBe('<b>&#60;x&#62;</b>')
  })

  it('renders links, mentions, math, emoji, time, reference, anchor', () => {
    expect(md(link('t', 'https://t.me/'))).toBe('[t](https://t.me/)')
    expect(html(link('t', 'https://t.me/'))).toBe('<a href="https://t.me/">t</a>')
    expect(md(mentionUser('u', 42))).toBe('[u](tg://user?id=42)')
    expect(md(math('E=mc^2'))).toBe('$E=mc^2$')
    expect(html(math('E=mc^2'))).toBe('<tg-math>E=mc^2</tg-math>')
    expect(md(customEmoji('555', '🔥'))).toBe('![🔥](tg://emoji?id=555)')
    expect(html(customEmoji('555', '🔥'))).toBe('<tg-emoji emoji-id="555">🔥</tg-emoji>')
    expect(md(time('22:45', 1647531900, 'wDT'))).toBe('![22:45](tg://time?unix=1647531900&format=wDT)')
    expect(md(reference('see', 'note-1'))).toBe('[see](#note-1)')
    expect(md(anchor('chapter-1'))).toBe('<a name="chapter-1"></a>')
  })
})

describe('inline url-injection safety', () => {
  it('escapes the link destination so a hostile href cannot break out', () => {
    expect(md(link('t', 'https://x/?a=1)evil'))).toBe('[t](https://x/?a=1\\)evil)')
    expect(md(link('t', 'a(b)c\\d e'))).toBe('[t](a\\(b\\)c\\\\d%20e)')
  })

  it('escapes hostile customEmoji id and time format in markdown urls', () => {
    expect(md(customEmoji('5)evil', 'x'))).toBe('![x](tg://emoji?id=5\\)evil)')
    expect(md(time('l', 1, 'x)evil'))).toBe('![l](tg://time?unix=1&format=x\\)evil)')
  })
})
