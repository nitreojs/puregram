import { describe, expect, it } from 'vitest'

import { RichError } from '../src/error'
import { makeNode } from '../src/node'
import { renderContent } from '../src/render'
import { Rich } from '../src/rich'

describe('renderContent', () => {
  it('escapes strings per dialect', () => {
    expect(renderContent('*x*', 'markdown')).toBe('\\*x\\*')
    expect(renderContent('<x>', 'html')).toBe('&#60;x&#62;')
  })

  it('renders nodes, stringifies numbers, drops nullish/false', () => {
    expect(renderContent(makeNode('inline', () => '**b**'), 'markdown')).toBe('**b**')
    expect(renderContent(42, 'markdown')).toBe('42')
    expect(renderContent(null, 'markdown')).toBe('')
    expect(renderContent(undefined, 'markdown')).toBe('')
    expect(renderContent(false, 'markdown')).toBe('')
  })

  it('inlines a matching-dialect Rich and joins arrays', () => {
    expect(renderContent(new Rich('markdown', '# hi'), 'markdown')).toBe('# hi')
    expect(renderContent(['a', makeNode('inline', () => '*b*'), 'c'], 'markdown')).toBe('a*b*c')
  })

  it('throws on a dialect-mismatched Rich', () => {
    expect(() => renderContent(new Rich('html', 'x'), 'markdown')).toThrow(RichError)
  })
})
