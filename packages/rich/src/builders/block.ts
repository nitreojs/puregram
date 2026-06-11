import { makeNode } from '../node'
import { type RichContent, escape, renderContent } from '../render'

/** section heading, level 1-6 */
export function heading (level: 1 | 2 | 3 | 4 | 5 | 6, content: RichContent) {
  return makeNode('block', d =>
    d === 'markdown' ? `${'#'.repeat(level)} ${renderContent(content, d)}` : `<h${level}>${renderContent(content, d)}</h${level}>`)
}

/** paragraph block */
export function paragraph (content: RichContent) {
  return makeNode('block', (d) => {
    const inner = renderContent(content, d)

    return d === 'markdown' ? inner : `<p>${inner}</p>`
  })
}

/** preformatted code block, optionally tagged with a language */
export function codeBlock (codeText: string, language = '') {
  return makeNode('block', (d) => {
    if (d === 'markdown') {
      return `\`\`\`${language}\n${codeText}\n\`\`\``
    }

    const cls = language ? ` class="language-${escape(language, 'html')}"` : ''

    return `<pre><code${cls}>${escape(codeText, 'html')}</code></pre>`
  })
}

// content may be a single piece or an array of lines; normalise to lines for markdown `>` prefixing
function lines (content: RichContent, dialect: 'markdown' | 'html') {
  const items = Array.isArray(content) ? content : [content]

  return items.map(item => renderContent(item, dialect))
}

/** block quotation */
export function blockquote (content: RichContent) {
  return makeNode('block', d =>
    d === 'markdown' ? lines(content, d).map(line => `>${line}`).join('\n') : `<blockquote>${lines(content, d).join('<br>')}</blockquote>`)
}

/** horizontal divider */
export function divider () {
  return makeNode('block', d => (d === 'markdown' ? '---' : '<hr/>'))
}

/** unordered list */
export function list (items: RichContent[]) {
  return makeNode('block', d =>
    d === 'markdown'
      ? items.map(item => `- ${renderContent(item, d)}`).join('\n')
      : `<ul>${items.map(item => `<li>${renderContent(item, d)}</li>`).join('')}</ul>`)
}

/** ordered list */
export function orderedList (items: RichContent[], options: { start?: number } = {}) {
  const start = options.start ?? 1

  return makeNode('block', d =>
    d === 'markdown'
      ? items.map((item, i) => `${start + i}. ${renderContent(item, d)}`).join('\n')
      : `<ol${options.start ? ` start="${options.start}"` : ''}>${items.map(item => `<li>${renderContent(item, d)}</li>`).join('')}</ol>`)
}

/** collapsible block (html-only tag; valid inside markdown too) */
export function details (summary: RichContent, body: RichContent, options: { open?: boolean } = {}) {
  const open = options.open ? ' open' : ''

  // a markdown body must be blank-line-separated or telegram renders it as literal html content
  return makeNode('block', (d) => {
    const head = `<details${open}><summary>${renderContent(summary, d)}</summary>`

    return d === 'markdown'
      ? `${head}\n\n${renderContent(body, d)}\n\n</details>`
      : `${head}${renderContent(body, d)}</details>`
  })
}

/** block-level LaTeX formula (content is raw latex, not escaped) */
export function mathBlock (latex: string) {
  return makeNode('block', d => (d === 'markdown' ? `$$${latex}$$` : `<tg-math-block>${latex}</tg-math-block>`))
}
