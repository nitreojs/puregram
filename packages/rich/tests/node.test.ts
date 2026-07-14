import { describe, expect, it } from 'vitest'

import { isRichNode, makeNode } from '../src/node'

describe('makeNode / isRichNode', () => {
  it('round-trips the level and the emitter', () => {
    const inline = makeNode('inline', () => 'x')
    const block = makeNode('block', () => ({ type: 'divider' }))

    expect(inline.level).toBe('inline')
    expect(inline.emit()).toBe('x')
    expect(block.level).toBe('block')
    expect(block.emit()).toEqual({ type: 'divider' })
  })

  it('recognises nodes and rejects foreign values', () => {
    expect(isRichNode(makeNode('block', () => 'x'))).toBe(true)
    expect(isRichNode('x')).toBe(false)
    expect(isRichNode(42)).toBe(false)
    expect(isRichNode(null)).toBe(false)
    expect(isRichNode(undefined)).toBe(false)
    expect(isRichNode({ level: 'inline', emit: () => 'x' })).toBe(false)
  })
})
