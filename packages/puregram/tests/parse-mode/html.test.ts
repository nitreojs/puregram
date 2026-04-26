import { describe, it, expect } from 'vitest'

import { HTML } from '../../src/parse-mode'

describe('HTML', () => {
  it('escapes special chars', () => {
    expect(HTML.escape('<script>')).toBe('&lt;script&gt;')
    expect(HTML.escape('a&b')).toBe('a&amp;b')
  })
  it('bold wraps in b tags', () => {
    expect(HTML.bold('<x>')).toBe('<b>&lt;x&gt;</b>')
  })
  it('escape=false skips escape', () => {
    expect(HTML.bold('<b>x</b>', false)).toBe('<b><b>x</b></b>')
  })
})
