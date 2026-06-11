import { describe, expect, it } from 'vitest'

import { escapeMarkdown, escapeHtml } from '../src/escape'

describe('escapeMarkdown', () => {
  it('backslash-escapes inline + block markdown specials', () => {
    expect(escapeMarkdown('*x* _y_ ~z~ `c` [a](b) #h |s| =m !i')).toBe(
      '\\*x\\* \\_y\\_ \\~z\\~ \\`c\\` \\[a\\]\\(b\\) \\#h \\|s\\| \\=m \\!i'
    )
  })

  it('escapes backslash itself; html-significant chars become entities (not \\< which telegram shows literally)', () => {
    expect(escapeMarkdown('a\\b <c> & >')).toBe('a\\\\b &#60;c&#62; &#38; &#62;')
  })

  it('leaves ordinary text untouched', () => {
    expect(escapeMarkdown('hello world 123')).toBe('hello world 123')
  })
})

describe('escapeHtml', () => {
  it('converts structural chars to numeric entities', () => {
    expect(escapeHtml('a & b < c > d " e')).toBe('a &#38; b &#60; c &#62; d &#34; e')
  })

  it('leaves ordinary text untouched', () => {
    expect(escapeHtml('hello world')).toBe('hello world')
  })
})
