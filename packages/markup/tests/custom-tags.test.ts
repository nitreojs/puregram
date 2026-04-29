import { describe, it, expect } from 'vitest'

import { MarkupParseError } from '../src/error'
import { Formatted } from '../src/formatted'
import { validateAndMerge, invokeHandler, scanCustomTags, countTagSiblings, indexOfSpan, MAX_DEPTH, type TagHandler } from '../src/parsers/custom-tags'

const noop: TagHandler = content => content

describe('validateAndMerge', () => {
  it('merges valid entries into the registry', () => {
    const registry = new Map<string, TagHandler>()

    validateAndMerge(registry, { h1: noop, callout: noop })

    expect(registry.size).toBe(2)
    expect(registry.get('h1')).toBe(noop)
    expect(registry.get('callout')).toBe(noop)
  })

  it('overwrites an existing entry on second call', () => {
    const registry = new Map<string, TagHandler>()
    const first: TagHandler = c => c
    const second: TagHandler = c => c

    validateAndMerge(registry, { h1: first })
    validateAndMerge(registry, { h1: second })

    expect(registry.get('h1')).toBe(second)
  })

  it('throws MarkupParseError when name collides with a built-in canonical', () => {
    const registry = new Map<string, TagHandler>()

    expect(() => validateAndMerge(registry, { b: noop })).toThrow(MarkupParseError)
    expect(() => validateAndMerge(registry, { b: noop })).toThrow(/cannot redefine built-in tag <b>/)
  })

  it('throws when name collides with a built-in alias (strong → b)', () => {
    const registry = new Map<string, TagHandler>()

    expect(() => validateAndMerge(registry, { strong: noop })).toThrow(MarkupParseError)
  })

  it('throws when name is the spoiler-via-class span', () => {
    const registry = new Map<string, TagHandler>()

    expect(() => validateAndMerge(registry, { span: noop })).toThrow(MarkupParseError)
  })

  it('throws on uppercase name', () => {
    const registry = new Map<string, TagHandler>()

    expect(() => validateAndMerge(registry, { H1: noop })).toThrow(MarkupParseError)
    expect(() => validateAndMerge(registry, { H1: noop })).toThrow(/invalid custom-tag name/)
  })

  it('throws on name starting with a digit', () => {
    const registry = new Map<string, TagHandler>()

    expect(() => validateAndMerge(registry, { '1tag': noop })).toThrow(MarkupParseError)
  })

  it('throws on name with disallowed characters', () => {
    const registry = new Map<string, TagHandler>()

    expect(() => validateAndMerge(registry, { h_1: noop })).toThrow(MarkupParseError)
    expect(() => validateAndMerge(registry, { 'h:1': noop })).toThrow(MarkupParseError)
  })

  it('accepts names with hyphens and digits (canonical custom tag form)', () => {
    const registry = new Map<string, TagHandler>()

    validateAndMerge(registry, { 'my-h1': noop, 'h1-section': noop })

    expect(registry.size).toBe(2)
  })

  it('throws TypeError when handler is not a function', () => {
    const registry = new Map<string, TagHandler>()

    expect(() => validateAndMerge(registry, { h1: 'not a fn' as unknown as TagHandler }))
      .toThrow(TypeError)
  })

  it('throws TypeError (not MarkupParseError) when handler is non-function AND name is a built-in', () => {
    const registry = new Map<string, TagHandler>()

    expect(() => validateAndMerge(registry, { b: 42 as unknown as TagHandler }))
      .toThrow(TypeError)
    expect(() => validateAndMerge(registry, { b: 42 as unknown as TagHandler }))
      .not.toThrow(MarkupParseError)
  })
})

const blankInfo = (tag = 'h1') => ({
  tag,
  attrs: {},
  parent: null,
  ancestors: [],
  index: 0,
  siblingCount: 1
})

describe('invokeHandler', () => {
  it('returns the handler result when handler succeeds', () => {
    const handler: TagHandler = content => content
    const result = invokeHandler(handler, new Formatted('hi', []), blankInfo())

    expect(result).toBeInstanceOf(Formatted)
    expect(result.text).toBe('hi')
  })

  it('rethrows MarkupParseError unchanged', () => {
    const original = new MarkupParseError('inner failure', 5, 'src')
    const handler: TagHandler = () => {
      throw original
    }

    expect(() => invokeHandler(handler, new Formatted('', []), blankInfo()))
      .toThrow(original)
  })

  it('wraps non-MarkupParseError thrown values with cause', () => {
    const original = new Error('boom')
    const handler: TagHandler = () => {
      throw original
    }

    let caught: unknown

    try {
      invokeHandler(handler, new Formatted('', []), blankInfo('callout'))
    } catch (err) {
      caught = err
    }

    expect(caught).toBeInstanceOf(MarkupParseError)
    expect((caught as MarkupParseError).message).toContain('custom-tag <callout> handler threw: boom')
    expect((caught as { cause: unknown }).cause).toBe(original)
  })

  it('wraps non-Error thrown values (string)', () => {
    const handler: TagHandler = () => {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal, no-throw-literal
      throw 'string-error'
    }

    expect(() => invokeHandler(handler, new Formatted('', []), blankInfo()))
      .toThrow(/custom-tag <h1> handler threw: string-error/)
  })

  it('throws MarkupParseError when depth would exceed MAX_DEPTH', () => {
    let calls = 0
    const handler: TagHandler = (content, info) => {
      calls += 1

      if (calls < MAX_DEPTH + 5) {
        return invokeHandler(handler, content, info)
      }

      return content
    }

    expect(() => invokeHandler(handler, new Formatted('x', []), blankInfo()))
      .toThrow(/custom-tag expansion depth exceeded \(32\); possible cycle in <h1>/)
  })

  it('decrements depth on success so subsequent invocations start fresh', () => {
    const handler: TagHandler = content => content

    expect(() => {
      for (let i = 0; i < MAX_DEPTH + 5; i++) {
        invokeHandler(handler, new Formatted(String(i), []), blankInfo())
      }
    }).not.toThrow()
  })

  it('decrements depth on throw so a subsequent invocation works', () => {
    const thrower: TagHandler = () => {
      throw new Error('boom')
    }
    const ok: TagHandler = content => content

    for (let i = 0; i < 5; i++) {
      try {
        invokeHandler(thrower, new Formatted('x', []), blankInfo())
      } catch {
        // intentional
      }
    }

    const out = invokeHandler(ok, new Formatted('post', []), blankInfo())

    expect(out.text).toBe('post')
  })
})

const reg = (...names: string[]) => {
  const m = new Map<string, TagHandler>()

  for (const n of names) {
    m.set(n, noop)
  }

  return m
}

describe('scanCustomTags', () => {
  it('returns no spans when registry is empty', () => {
    expect(scanCustomTags('<h1>x</h1>', new Map())).toEqual([])
  })

  it('returns no spans when source has no custom tags', () => {
    expect(scanCustomTags('<b>plain</b>text', reg('h1'))).toEqual([])
  })

  it('finds a single custom-tag span', () => {
    const spans = scanCustomTags('<h1>title</h1>', reg('h1'))

    expect(spans).toHaveLength(1)
    expect(spans[0]).toMatchObject({
      tag: 'h1',
      attrs: {},
      openStart: 0,
      contentStart: 4,
      closeStart: 9,
      closeEnd: 14,
      selfClosing: false
    })
  })

  it('parses attrs on the open tag', () => {
    const spans = scanCustomTags('<callout type="warn">x</callout>', reg('callout'))

    expect(spans).toHaveLength(1)
    expect(spans[0].tag).toBe('callout')
    expect(spans[0].attrs).toEqual({ type: 'warn' })
  })

  it('handles boolean attrs (no value)', () => {
    const spans = scanCustomTags('<callout warn>x</callout>', reg('callout'))

    expect(spans[0].attrs).toEqual({ warn: '' })
  })

  it('finds matching close past nested same-name custom tags', () => {
    const src = '<h1>outer<h1>inner</h1>tail</h1>'
    const spans = scanCustomTags(src, reg('h1'))

    // only the outer is a top-level span; the inner h1 is inside outer's content
    expect(spans).toHaveLength(1)
    expect(spans[0].openStart).toBe(0)
    expect(spans[0].contentStart).toBe(4)
    // close tag position varies depending on byte offsets — assert relative to known string positions
    expect(src.slice(spans[0].closeStart, spans[0].closeEnd)).toBe('</h1>')
    expect(spans[0].closeEnd).toBe(src.length)
  })

  it('returns spans in document order for sibling custom tags', () => {
    const spans = scanCustomTags('<h1>a</h1><h1>b</h1>', reg('h1'))

    expect(spans).toHaveLength(2)
    expect(spans[0].openStart).toBe(0)
    expect(spans[1].openStart).toBe(10)
  })

  it('treats self-closing custom tags', () => {
    const src = '<icon name="bell"/>after'
    const spans = scanCustomTags(src, reg('icon'))

    expect(spans).toHaveLength(1)
    expect(spans[0].selfClosing).toBe(true)
    expect(spans[0].attrs).toEqual({ name: 'bell' })
    expect(spans[0].contentStart).toBe(spans[0].closeStart)
    expect(spans[0].closeEnd).toBe('<icon name="bell"/>'.length)
  })

  it('throws on unclosed custom tag', () => {
    expect(() => scanCustomTags('<h1>oops', reg('h1'))).toThrow(MarkupParseError)
    expect(() => scanCustomTags('<h1>oops', reg('h1'))).toThrow(/unclosed custom tag <h1>/)
  })

  it('skips built-in tags entirely (does not see them as spans)', () => {
    const spans = scanCustomTags('<b><h1>x</h1></b>', reg('h1'))

    // <h1> is a top-level custom-tag span — not nested inside another custom tag
    // (the surrounding <b> is built-in, doesn't shield)
    expect(spans).toHaveLength(1)
    expect(spans[0].tag).toBe('h1')
  })

  it('skips sentinel-laden segments (sentinels never start a tag)', () => {
    // sentinels are SOH () — not '<' — so the scanner naturally ignores them
    const src = '0<h1>x</h1>'
    const spans = scanCustomTags(src, reg('h1'))

    expect(spans).toHaveLength(1)
    expect(spans[0].openStart).toBe(3)
  })

  it('treats lowercase canonical: <H1> matches registered "h1"', () => {
    const spans = scanCustomTags('<H1>x</H1>', reg('h1'))

    expect(spans).toHaveLength(1)
    expect(spans[0].tag).toBe('h1')
  })
})

describe('countTagSiblings', () => {
  it('counts open tags at the top level', () => {
    expect(countTagSiblings('<b>x</b><i>y</i>')).toBe(2)
  })

  it('does not count text nodes', () => {
    expect(countTagSiblings('text<b>x</b>more text<i>y</i>tail')).toBe(2)
  })

  it('does not count nested tags', () => {
    expect(countTagSiblings('<b><i>nested</i></b>')).toBe(1)
  })

  it('does not count close tags', () => {
    expect(countTagSiblings('</b>')).toBe(0)
  })

  it('counts a self-closing tag once', () => {
    expect(countTagSiblings('<icon/>')).toBe(1)
  })

  it('counts mixed built-in + (would-be) custom names equally — count is name-agnostic', () => {
    expect(countTagSiblings('<b>x</b><h1>y</h1><i>z</i>')).toBe(3)
  })

  it('returns 0 on empty source', () => {
    expect(countTagSiblings('')).toBe(0)
  })

  it('returns 0 on text-only source', () => {
    expect(countTagSiblings('plain text')).toBe(0)
  })
})

describe('indexOfSpan', () => {
  it('returns 0 for the first sibling', () => {
    expect(indexOfSpan('<h1>x</h1><h1>y</h1>', 0)).toBe(0)
  })

  it('returns 1 for the second sibling when first is built-in', () => {
    expect(indexOfSpan('<b>x</b><h1>y</h1>', '<b>x</b>'.length)).toBe(1)
  })

  it('counts text nodes as zero contribution to index', () => {
    const src = 'text<b>a</b>more<h1>b</h1>'

    expect(indexOfSpan(src, src.indexOf('<h1>'))).toBe(1)
  })

  it('does not count tags nested inside earlier siblings', () => {
    const src = '<b><i>deep</i></b><h1>x</h1>'

    expect(indexOfSpan(src, src.indexOf('<h1>'))).toBe(1)
  })
})
