import { describe, expect, it } from 'vitest'
import { makeNode, isRichNode } from '../src/node'

describe('makeNode / isRichNode', () => {
  it('builds a node that renders per dialect', () => {
    const n = makeNode('inline', d => (d === 'markdown' ? '**x**' : '<b>x</b>'))
    expect(n.level).toBe('inline')
    expect(n.render('markdown')).toBe('**x**')
    expect(n.render('html')).toBe('<b>x</b>')
  })

  it('recognises nodes and rejects non-nodes', () => {
    expect(isRichNode(makeNode('block', () => 'x'))).toBe(true)
    expect(isRichNode('x')).toBe(false)
    expect(isRichNode(null)).toBe(false)
    expect(isRichNode({ level: 'inline' })).toBe(false)
  })
})
