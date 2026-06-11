// packages/rich/tests/compose.test.ts
import { describe, expect, it } from 'vitest'

import { heading } from '../src/builders/block'
import { join, br } from '../src/builders/compose'
import { bold } from '../src/builders/inline'

const md = (n: { render: (d: 'markdown' | 'html') => string }) => n.render('markdown')
const html = (n: { render: (d: 'markdown' | 'html') => string }) => n.render('html')

describe('join', () => {
  it('joins items with a string separator, escaping strings', () => {
    expect(md(join(['a', bold('b'), '*c*'], ', '))).toBe('a, **b**, \\*c\\*')
  })

  it('joins with a node separator', () => {
    expect(html(join(['a', 'b'], br()))).toBe('a<br>b')
  })

  it('is inline when all items are inline, block (newline-joined) when any item is a block', () => {
    expect(join(['a', bold('b')]).level).toBe('inline')
    const blocky = join([heading(1, 'A'), heading(2, 'B')])

    expect(blocky.level).toBe('block')
    expect(md(blocky)).toBe('# A\n## B')
  })
})

describe('br', () => {
  it('renders a line break per dialect', () => {
    expect(md(br())).toBe('\n')
    expect(html(br())).toBe('<br>')
  })
})
