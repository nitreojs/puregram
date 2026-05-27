import { describe, it, expect } from 'vitest'

import { htmlb } from '../src/parsers/html'

describe('htmlb', () => {
  it('translates <br> to \\n', () => {
    expect(htmlb('foo<br>bar').text).toBe('foo\nbar')
  })

  it('absorbs whitespace surrounding <br>', () => {
    expect(htmlb('foo <br>\n  bar').text).toBe('foo\nbar')
  })

  it('still collapses non-<br> whitespace runs to a single space', () => {
    expect(htmlb('foo   bar').text).toBe('foo bar')
  })

  it('works as tagged template', () => {
    expect(htmlb`line1<br>line2 with ${'X'}`.text).toBe('line1\nline2 with X')
  })

  it('preserves entities across <br>', () => {
    const f = htmlb('<b>line1<br>line2</b>')

    expect(f.text).toBe('line1\nline2')
    expect(f.entities[0]).toMatchObject({ type: 'bold', offset: 0, length: 11 })
  })

  it('handles self-closing <br/> and <br /> too', () => {
    expect(htmlb('a<br/>b<br />c').text).toBe('a\nb\nc')
  })

  it('handles extra whitespace inside the tag', () => {
    expect(htmlb('a<br  >b<br / >c').text).toBe('a\nb\nc')
  })

  it('stays linear on many tabs inside <br>', () => {
    expect(htmlb(`<br${'\t'.repeat(100_000)}>`).text).toBe('\n')
  })
})
