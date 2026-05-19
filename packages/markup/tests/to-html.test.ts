import { describe, it, expect } from 'vitest'

import { Formatted } from '../src/formatted'
import { html } from '../src/parsers/html'
import { toHtml } from '../src/serializers/html'

describe('toHtml', () => {
  it('serializes plain text with no entities', () => {
    expect(toHtml(new Formatted('hello world', []))).toBe('hello world')
  })

  it('escapes < > & " in plain text', () => {
    expect(toHtml(new Formatted('a < b & "c"', []))).toBe('a &lt; b &amp; &quot;c&quot;')
  })

  it('emits <b> for bold', () => {
    expect(toHtml(new Formatted('hi', [{ type: 'bold', offset: 0, length: 2 }]))).toBe('<b>hi</b>')
  })

  it('emits <i>, <u>, <s>, <tg-spoiler>', () => {
    expect(toHtml(new Formatted('x', [{ type: 'italic', offset: 0, length: 1 }]))).toBe('<i>x</i>')
    expect(toHtml(new Formatted('x', [{ type: 'underline', offset: 0, length: 1 }]))).toBe('<u>x</u>')
    expect(toHtml(new Formatted('x', [{ type: 'strikethrough', offset: 0, length: 1 }]))).toBe('<s>x</s>')
    expect(toHtml(new Formatted('x', [{ type: 'spoiler', offset: 0, length: 1 }]))).toBe('<tg-spoiler>x</tg-spoiler>')
  })

  it('nests entities', () => {
    const f = new Formatted('hi', [
      { type: 'bold', offset: 0, length: 2 },
      { type: 'italic', offset: 0, length: 2 }
    ])

    expect(toHtml(f)).toBe('<b><i>hi</i></b>')
  })

  it('emits <a href="…"> for text_link with escaping', () => {
    const f = new Formatted('site', [{ type: 'text_link', offset: 0, length: 4, url: 'https://x.com/?a=1&b=2' }])

    expect(toHtml(f)).toBe('<a href="https://x.com/?a=1&amp;b=2">site</a>')
  })

  it('emits tg://user?id link for text_mention', () => {
    const f = new Formatted('Alice', [{
      type: 'text_mention', offset: 0, length: 5, user: { id: 42, is_bot: false, first_name: 'Alice' }
    }])

    expect(toHtml(f)).toBe('<a href="tg://user?id=42">Alice</a>')
  })

  it('emits <code> and <pre> (escaping only the body set inside)', () => {
    const c = new Formatted('a<b', [{ type: 'code', offset: 0, length: 3 }])

    expect(toHtml(c)).toBe('<code>a&lt;b</code>')

    const p = new Formatted('console.log(1)', [{ type: 'pre', offset: 0, length: 14, language: 'js' }])

    expect(toHtml(p)).toBe('<pre><code class="language-js">console.log(1)</code></pre>')
  })

  it('emits expandable blockquote', () => {
    const f = new Formatted('hi', [{ type: 'expandable_blockquote', offset: 0, length: 2 }])

    expect(toHtml(f)).toBe('<blockquote expandable>hi</blockquote>')
  })

  it('emits <tg-emoji emoji-id="…"> for custom_emoji', () => {
    const f = new Formatted('X', [{ type: 'custom_emoji', offset: 0, length: 1, custom_emoji_id: '5448' }])

    expect(toHtml(f)).toBe('<tg-emoji emoji-id="5448">X</tg-emoji>')
  })

  it('round-trips: html`<b>hi</b>` → toHtml() matches', () => {
    const f = html`<b>hi</b>`

    expect(toHtml(f)).toBe('<b>hi</b>')
  })

  it('round-trips nested bold-inside-italic (re-parsing matches)', () => {
    const f = html`<i><b>hi</b></i>`
    const serialized = toHtml(f)
    const reparsed = html(serialized)

    expect(reparsed.text).toBe(f.text)
    expect([...reparsed.entities].sort((a, b) => a.offset - b.offset || a.type.localeCompare(b.type))).toEqual(
      [...f.entities].sort((a, b) => a.offset - b.offset || a.type.localeCompare(b.type))
    )
  })

  it('round-trips a text_link', () => {
    const f = html`<a href="https://x.com">hi</a>`

    expect(toHtml(f)).toBe('<a href="https://x.com">hi</a>')
  })

  it('round-trips a pre with language', () => {
    const f = html`<pre><code class="language-js">console.log(1)</code></pre>`

    expect(toHtml(f)).toBe('<pre><code class="language-js">console.log(1)</code></pre>')
  })

  it('formatted.toHtml() is a method shortcut', () => {
    const f = new Formatted('hi', [{ type: 'bold', offset: 0, length: 2 }])

    expect(f.toHtml()).toBe('<b>hi</b>')
  })
})
