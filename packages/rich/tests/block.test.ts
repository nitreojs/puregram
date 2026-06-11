// packages/rich/tests/block.test.ts
import { describe, expect, it } from 'vitest'
import {
  heading, paragraph, codeBlock, blockquote, divider,
  list, orderedList, details, mathBlock
} from '../src/builders/block'

const md = (n: { render: (d: 'markdown' | 'html') => string }) => n.render('markdown')
const html = (n: { render: (d: 'markdown' | 'html') => string }) => n.render('html')

describe('block builders', () => {
  it('renders headings at the requested level', () => {
    expect(md(heading(1, 'A'))).toBe('# A')
    expect(md(heading(3, 'A'))).toBe('### A')
    expect(html(heading(2, 'A'))).toBe('<h2>A</h2>')
  })

  it('renders paragraph, divider, code block', () => {
    expect(md(paragraph('text'))).toBe('text')
    expect(md(divider())).toBe('---')
    expect(html(divider())).toBe('<hr/>')
    expect(md(codeBlock("print('x')", 'python'))).toBe("```python\nprint('x')\n```")
    expect(html(codeBlock("print('x')", 'python'))).toBe('<pre><code class="language-python">print(\'x\')</code></pre>')
  })

  it('renders blockquote with multiple lines', () => {
    expect(md(blockquote(['a', 'b']))).toBe('>a\n>b')
  })

  it('renders lists', () => {
    expect(md(list(['a', 'b']))).toBe('- a\n- b')
    expect(html(list(['a']))).toBe('<ul><li>a</li></ul>')
    expect(md(orderedList(['a', 'b']))).toBe('1. a\n2. b')
  })

  it('renders details + math block', () => {
    expect(html(details('Title', 'Content'))).toBe('<details><summary>Title</summary>Content</details>')
    expect(html(details('Title', 'Content', { open: true }))).toBe('<details open><summary>Title</summary>Content</details>')
    expect(md(mathBlock('E=mc^2'))).toBe('$$E=mc^2$$')
    expect(html(mathBlock('E=mc^2'))).toBe('<tg-math-block>E=mc^2</tg-math-block>')
  })

  it('marks blocks with block level', () => {
    expect(heading(1, 'A').level).toBe('block')
    expect(list(['a']).level).toBe('block')
  })
})
