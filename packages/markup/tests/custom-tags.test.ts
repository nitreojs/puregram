import { describe, it, expect } from 'vitest'

import { MarkupParseError } from '../src/error'
import { validateAndMerge, type TagHandler } from '../src/parsers/custom-tags'

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
})
