import { describe, it, expect } from 'vitest'

import { MarkupParseError } from '../src/error'
import { Formatted } from '../src/formatted'
import { html } from '../src/parsers/html'

describe('html() function form', () => {
  it('parses <b> as bold', () => {
    const f = html('<b>hi</b>')

    expect(f.text).toBe('hi')
    expect(f.entities).toEqual([{ type: 'bold', offset: 0, length: 2 }])
  })

  it('accepts <strong> as alias for <b>', () => {
    expect(html('<strong>x</strong>').entities[0].type).toBe('bold')
  })

  it('accepts <em>, <italic> as aliases for <i>', () => {
    expect(html('<em>x</em>').entities[0].type).toBe('italic')
    expect(html('<italic>x</italic>').entities[0].type).toBe('italic')
  })

  it('accepts <ins> as alias for <u> and <strike>/<del> as aliases for <s>', () => {
    expect(html('<ins>x</ins>').entities[0].type).toBe('underline')
    expect(html('<strike>x</strike>').entities[0].type).toBe('strikethrough')
    expect(html('<del>x</del>').entities[0].type).toBe('strikethrough')
  })

  it('accepts <spoiler>, <tg-spoiler>, and <span class="tg-spoiler"> as spoiler', () => {
    expect(html('<spoiler>x</spoiler>').entities[0].type).toBe('spoiler')
    expect(html('<tg-spoiler>x</tg-spoiler>').entities[0].type).toBe('spoiler')
    expect(html('<span class="tg-spoiler">x</span>').entities[0].type).toBe('spoiler')
  })

  it('parses <a href="…"> as text_link', () => {
    const f = html('<a href="https://x.com">hi</a>')

    expect(f.entities).toEqual([{ type: 'text_link', offset: 0, length: 2, url: 'https://x.com' }])
  })

  it('parses <code> as code', () => {
    expect(html('<code>x</code>').entities[0].type).toBe('code')
  })

  it('parses <pre> as pre', () => {
    expect(html('<pre>x</pre>').entities[0].type).toBe('pre')
  })

  it('parses <pre><code class="language-js"> as pre with language', () => {
    const f = html('<pre><code class="language-js">x</code></pre>')

    expect(f.entities[0]).toMatchObject({ type: 'pre', language: 'js' })
  })

  it('parses <blockquote> as blockquote and <blockquote expandable> as expandable_blockquote', () => {
    expect(html('<blockquote>x</blockquote>').entities[0].type).toBe('blockquote')
    expect(html('<blockquote expandable>x</blockquote>').entities[0].type).toBe('expandable_blockquote')
  })

  it('parses <tg-emoji emoji-id="…"> and <emoji id="…">', () => {
    expect(html('<tg-emoji emoji-id="42">x</tg-emoji>').entities[0]).toMatchObject({ type: 'custom_emoji', custom_emoji_id: '42' })
    expect(html('<emoji id="99">x</emoji>').entities[0]).toMatchObject({ type: 'custom_emoji', custom_emoji_id: '99' })
  })

  it('handles nested entities — <b>foo <i>bar</i></b>', () => {
    const f = html('<b>foo <i>bar</i></b>')

    expect(f.text).toBe('foo bar')
    expect(f.entities).toEqual([
      { type: 'bold', offset: 0, length: 7 },
      { type: 'italic', offset: 4, length: 3 }
    ])
  })

  it('decodes core HTML entities — &amp;, &lt;, &gt;, &quot;, &#NNN;', () => {
    expect(html('a &amp; b').text).toBe('a & b')
    expect(html('&lt;tag&gt;').text).toBe('<tag>')
    expect(html('&#65;').text).toBe('A')
  })

  it('collapses whitespace runs to a single space', () => {
    expect(html('foo   bar\n\n  baz').text).toBe('foo bar baz')
  })

  it('strips leading/trailing whitespace', () => {
    expect(html('  hello  ').text).toBe('hello')
  })

  it('returns a Formatted', () => {
    expect(html('plain')).toBeInstanceOf(Formatted)
  })

  it('throws MarkupParseError on unknown tag', () => {
    expect(() => html('<wat>x</wat>')).toThrow(MarkupParseError)
  })

  it('throws MarkupParseError on unclosed tag', () => {
    expect(() => html('<b>oops')).toThrow(MarkupParseError)
  })

  it('throws MarkupParseError on mismatched closing tag', () => {
    expect(() => html('<b>x</i>')).toThrow(MarkupParseError)
  })

  it('throws MarkupParseError on <a> without href', () => {
    expect(() => html('<a>x</a>')).toThrow(MarkupParseError)
  })
})

describe('html`` tagged-template form', () => {
  it('treats string interpolations as literal text', () => {
    const userName = 'A**lice**'
    const f = html`<b>${userName}</b>`

    expect(f.text).toBe('A**lice**')
    expect(f.entities[0].length).toBe('A**lice**'.length)
  })

  it('does not let interpolated strings open or close tags', () => {
    const evil = '</b>'
    const f = html`<b>${evil}</b>`

    expect(f.text).toBe('</b>')
    expect(f.entities[0]).toMatchObject({ type: 'bold', offset: 0, length: 4 })
  })

  it('merges Formatted interpolations with offset shift', () => {
    const inner = new Formatted('x', [{ type: 'italic', offset: 0, length: 1 }])
    const f = html`a ${inner} b`

    expect(f.text).toBe('a x b')
    expect(f.entities).toEqual([{ type: 'italic', offset: 2, length: 1 }])
  })

  it('coerces numbers to literal text', () => {
    expect(html`count=${42}`.text).toBe('count=42')
  })

  it('skips null/undefined/false', () => {
    expect(html`a${null}b${undefined}c${false}d`.text).toBe('abcd')
  })
})
