import { describe, it, expect } from 'vitest'

import { MarkupParseError } from '../src/error'
import { Formatted } from '../src/formatted'
import { validateAndMerge, invokeHandler, MAX_DEPTH, type TagHandler } from '../src/parsers/custom-tags'

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
