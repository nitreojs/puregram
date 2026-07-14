import { describe, expect, it } from 'vitest'

import { emitBlocks, emitText } from '../src/emit'
import { RichError, RichParseError } from '../src/error'
import { rich } from '../src/namespace'
import { isRichNode, makeNode } from '../src/node'
import { Rich } from '../src/rich'

describe('public surface', () => {
  it('rich is callable and carries the builders', () => {
    expect(typeof rich).toBe('function')
    expect(rich('x')).toBeInstanceOf(Rich)
    expect(isRichNode(rich.bold('x'))).toBe(true)
    expect(isRichNode(rich.heading(1, 'x'))).toBe(true)
    expect(isRichNode(rich.table([['a']]))).toBe(true)
    expect(isRichNode(rich.join(['a', 'b']))).toBe(true)
  })

  it('exposes the raw passthrough tags', () => {
    expect(rich.raw.md('x').dialect).toBe('markdown')
    expect(rich.raw.markdown).toBe(rich.raw.md)
    expect(rich.raw.html('x').dialect).toBe('html')
  })

  it('exposes the core primitives', () => {
    expect(typeof makeNode).toBe('function')
    expect(typeof emitText).toBe('function')
    expect(typeof emitBlocks).toBe('function')
  })

  it('RichParseError extends RichError and carries the position', () => {
    const err = new RichParseError('bad token', 3, '# src')

    expect(err).toBeInstanceOf(RichError)
    expect(err.message).toBe('bad token (at 3)')
    expect(err.position).toBe(3)
    expect(err.source).toBe('# src')
  })
})
