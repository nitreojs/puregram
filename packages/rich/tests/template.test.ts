import { describe, expect, it } from 'vitest'

import { makeNode } from '../src/node'
import { Rich } from '../src/rich'
import { makeTemplate } from '../src/template'

const md = makeTemplate('markdown')
const html = makeTemplate('html')

describe('makeTemplate', () => {
  it('passes literal text through and escapes interpolated strings', () => {
    const r = md`# heading ${'*not bold*'}`

    expect(r).toBeInstanceOf(Rich)
    expect(r.dialect).toBe('markdown')
    expect(r.content).toBe('# heading \\*not bold\\*')
  })

  it('renders interpolated nodes without escaping', () => {
    const bold = makeNode('inline', () => '**b**')

    expect(md`x ${bold} y`.content).toBe('x **b** y')
  })

  it('dedents multi-line templates and trims blank edges', () => {
    const r = md`
      # title

      body
    `

    expect(r.content).toBe('# title\n\nbody')
  })

  it('accepts a direct string form (no interpolation, no dedent)', () => {
    expect(md('# raw').content).toBe('# raw')
  })

  it('html template escapes interpolations as entities', () => {
    expect(html`<b>${'<x>'}</b>`.content).toBe('<b>&#60;x&#62;</b>')
  })
})

describe('block-array form', () => {
  it('composes a plain array of block nodes, blank-line separated', () => {
    const h = makeNode('block', () => '# a')
    const l = makeNode('block', () => '- x\n- y')

    expect(md([h, l]).content).toBe('# a\n\n- x\n- y')
  })

  it('renders the array in the tag dialect', () => {
    const n = makeNode('block', d => (d === 'markdown' ? '---' : '<hr/>'))

    expect(html([n, n]).content).toBe('<hr/>\n\n<hr/>')
  })
})
