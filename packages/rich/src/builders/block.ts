import { escapeMarkdownUrl } from '../escape'
import { type RichNode, makeNode } from '../node'
import { type RichContent, escape, renderContent } from '../render'

/** section heading, level 1-6 */
export function heading (level: 1 | 2 | 3 | 4 | 5 | 6, content: RichContent) {
  return makeNode('block', d =>
    d === 'markdown' ? `${'#'.repeat(level)} ${renderContent(content, d)}` : `<h${level}>${renderContent(content, d)}</h${level}>`)
}

/** `heading(1, content)` */
export const h1 = (content: RichContent) => heading(1, content)
/** `heading(2, content)` */
export const h2 = (content: RichContent) => heading(2, content)
/** `heading(3, content)` */
export const h3 = (content: RichContent) => heading(3, content)
/** `heading(4, content)` */
export const h4 = (content: RichContent) => heading(4, content)
/** `heading(5, content)` */
export const h5 = (content: RichContent) => heading(5, content)
/** `heading(6, content)` */
export const h6 = (content: RichContent) => heading(6, content)

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

/** footer block (html-only tag, valid in markdown too) */
export function footer (content: RichContent) {
  return makeNode('block', d => `<footer>${renderContent(content, d)}</footer>`)
}

/** pull quote (html-only tag), optionally crediting a source */
export function pullQuote (content: RichContent, cite?: RichContent) {
  return makeNode('block', (d) => {
    const credit = cite === undefined ? '' : `<cite>${renderContent(cite, d)}</cite>`

    return `<aside>${renderContent(content, d)}${credit}</aside>`
  })
}

/** markdown checkbox list */
export function taskList (items: { text: RichContent, done?: boolean }[]) {
  return makeNode('block', d =>
    d === 'markdown'
      ? items.map(i => `- [${i.done ? 'x' : ' '}] ${renderContent(i.text, d)}`).join('\n')
      : `<ul>${items.map(i => `<li>${i.done ? '☑' : '☐'} ${renderContent(i.text, d)}</li>`).join('')}</ul>`)
}

export type MediaType = 'photo' | 'video' | 'audio'

export interface MediaOptions {
  type?: MediaType
  caption?: RichContent
  spoiler?: boolean
}

// telegram infers media type from mime/url, but the html tag must be chosen up front
function inferMediaType (url: string) {
  const ext = (/\.([a-z0-9]+)(?:[?#]|$)/i.exec(url)?.[1] ?? '').toLowerCase()

  if (['mp4', 'mov', 'webm', 'gif'].includes(ext)) {
    return 'video'
  }

  if (['mp3', 'ogg', 'oga', 'm4a', 'wav'].includes(ext)) {
    return 'audio'
  }

  return 'photo'
}

/** media block by http(s) url (photo / video / audio) */
export function media (url: string, options: MediaOptions = {}) {
  return makeNode('block', (d) => {
    if (d === 'markdown') {
      const title = options.caption === undefined ? '' : ` "${renderContent(options.caption, d).replace(/"/g, '&#34;')}"`

      return `![](${escapeMarkdownUrl(url)}${title})`
    }

    const type = options.type ?? inferMediaType(url)
    const spoiler = options.spoiler ? ' tg-spoiler' : ''
    const element = type === 'photo'
      ? `<img src="${escape(url, 'html')}"${spoiler}/>`
      : `<${type} src="${escape(url, 'html')}"${spoiler}></${type}>`

    return options.caption === undefined
      ? element
      : `<figure>${element}<figcaption>${renderContent(options.caption, d)}</figcaption></figure>`
  })
}

/** photo media block */
export function photo (url: string, options: Omit<MediaOptions, 'type'> = {}) {
  return media(url, { ...options, type: 'photo' })
}

/** video media block */
export function video (url: string, options: Omit<MediaOptions, 'type'> = {}) {
  return media(url, { ...options, type: 'video' })
}

/** audio media block */
export function audio (url: string, options: Omit<MediaOptions, 'type'> = {}) {
  return media(url, { ...options, type: 'audio' })
}

/** location map (html-only tag) */
export function map (latitude: number, longitude: number, options: { zoom?: number, caption?: RichContent } = {}) {
  return makeNode('block', (d) => {
    const zoom = options.zoom === undefined ? '' : ` zoom="${options.zoom}"`
    const element = `<tg-map lat="${latitude}" long="${longitude}"${zoom}/>`

    return options.caption === undefined
      ? element
      : `<figure>${element}<figcaption>${renderContent(options.caption, d)}</figcaption></figure>`
  })
}

function mediaGroup (tag: string, items: readonly RichNode[], caption: RichContent | undefined) {
  return makeNode('block', (d) => {
    const cap = caption === undefined ? '' : `<figcaption>${renderContent(caption, d)}</figcaption>`

    if (d === 'markdown') {
      // media inside a collage/slideshow must be blank-line-separated for telegram to parse it
      return `<${tag}>\n\n${items.map(i => renderContent(i, d)).join('\n')}\n\n${cap}</${tag}>`
    }

    return `<${tag}>${items.map(i => renderContent(i, d)).join('')}${cap}</${tag}>`
  })
}

/** photo/video collage (html-only tag) */
export function collage (items: readonly RichNode[], options: { caption?: RichContent } = {}) {
  return mediaGroup('tg-collage', items, options.caption)
}

/** photo/video slideshow (html-only tag) */
export function slideshow (items: readonly RichNode[], options: { caption?: RichContent } = {}) {
  return mediaGroup('tg-slideshow', items, options.caption)
}

export type Align = 'left' | 'center' | 'right'

export interface TableOptions {
  header?: boolean
  align?: Align[]
  bordered?: boolean
  striped?: boolean
  caption?: RichContent
}

const ALIGN_MD: Record<Align, string> = { left: ':--', center: ':-:', right: '--:' }

/** table of inline cells. markdown emits a gfm table (the first row is the header) */
export function table (rows: RichContent[][], options: TableOptions = {}) {
  const header = options.header ?? true

  return makeNode('block', (d) => {
    if (d === 'markdown') {
      // renderContent already escapes `|` (it's a markdown special), so cells are pipe-safe
      const row = (cells: RichContent[]) => `| ${cells.map(c => renderContent(c, d)).join(' | ')} |`
      const head = rows[0] ?? []
      const separator = `| ${head.map((_, i) => ALIGN_MD[options.align?.[i] ?? 'left']).join(' | ')} |`

      return [row(head), separator, ...rows.slice(1).map(row)].join('\n')
    }

    const attrs = `${options.bordered ? ' bordered' : ''}${options.striped ? ' striped' : ''}`
    const cap = options.caption === undefined ? '' : `<caption>${renderContent(options.caption, d)}</caption>`
    const cells = (cs: RichContent[], head: boolean) => cs.map((c, i) => {
      const tag = head ? 'th' : 'td'
      const align = options.align?.[i] ? ` align="${options.align[i] as Align}"` : ''

      return `<${tag}${align}>${renderContent(c, d)}</${tag}>`
    }).join('')
    const body = rows.map((r, ri) => `<tr>${cells(r, header && ri === 0)}</tr>`).join('')

    return `<table${attrs}>${cap}${body}</table>`
  })
}

/** footnote definition — the text behind a `footnoteRef(id)` marker (usually placed at the end) */
export function footnote (id: string, definition: RichContent) {
  return makeNode('block', d =>
    d === 'markdown'
      ? `[^${id}]: ${renderContent(definition, d)}`
      : `<tg-reference name="${escape(id, 'html')}">${renderContent(definition, d)}</tg-reference>`)
}

/** alias for `blockquote` */
export const quote = blockquote
/** alias for `codeBlock` */
export const pre = codeBlock
/** alias for `divider` */
export const hr = divider
/** alias for `footnote` */
export const fn = footnote
