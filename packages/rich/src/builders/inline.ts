import { escapeMarkdownUrl } from '../escape'
import { type Dialect, makeNode } from '../node'
import { type RichContent, escape, renderContent } from '../render'

// a wrapper builder: same shape in both dialects, differing only in the surrounding tokens
function wrap (mdToken: (inner: string) => string, htmlToken: (inner: string) => string) {
  return (content: RichContent) =>
    makeNode('inline', dialect => (dialect === 'markdown' ? mdToken : htmlToken)(renderContent(content, dialect)))
}

/** bold text */
export const bold = wrap(x => `**${x}**`, x => `<b>${x}</b>`)
/** italic text */
export const italic = wrap(x => `*${x}*`, x => `<i>${x}</i>`)
/** underlined text (no markdown token — html in both) */
export const underline = wrap(x => `<u>${x}</u>`, x => `<u>${x}</u>`)
/** strikethrough text */
export const strikethrough = wrap(x => `~~${x}~~`, x => `<s>${x}</s>`)
/** spoiler text */
export const spoiler = wrap(x => `||${x}||`, x => `<tg-spoiler>${x}</tg-spoiler>`)
/** inline fixed-width code */
export const code = wrap(x => `\`${x}\``, x => `<code>${x}</code>`)
/** marked / highlighted text */
export const marked = wrap(x => `==${x}==`, x => `<mark>${x}</mark>`)
/** subscript text (no markdown token — html in both) */
export const subscript = wrap(x => `<sub>${x}</sub>`, x => `<sub>${x}</sub>`)
/** superscript text (no markdown token — html in both) */
export const superscript = wrap(x => `<sup>${x}</sup>`, x => `<sup>${x}</sup>`)

// a url escaper: markdown escapes the link-destination terminators, html escapes attribute quotes
function url (raw: string, dialect: Dialect) {
  return dialect === 'markdown' ? escapeMarkdownUrl(raw) : escape(raw, 'html')
}

/** inline link */
export function link (text: RichContent, href: string) {
  return makeNode('inline', d =>
    d === 'markdown' ? `[${renderContent(text, d)}](${url(href, d)})` : `<a href="${url(href, d)}">${renderContent(text, d)}</a>`)
}

/** inline mention of a user by id */
export function mentionUser (text: RichContent, userId: number) {
  return link(text, `tg://user?id=${userId}`)
}

/** inline LaTeX formula (content is raw latex, not escaped) */
export function math (latex: string) {
  return makeNode('inline', d => (d === 'markdown' ? `$${latex}$` : `<tg-math>${latex}</tg-math>`))
}

/** custom emoji by document id, with alternative text */
export function customEmoji (id: string, alt: string) {
  return makeNode('inline', d =>
    d === 'markdown' ? `![${escape(alt, d)}](${escapeMarkdownUrl(`tg://emoji?id=${id}`)})` : `<tg-emoji emoji-id="${escape(id, 'html')}">${escape(alt, 'html')}</tg-emoji>`)
}

/** auto-formatted date-time (see telegram's date-time entity formatting for `format`) */
export function time (label: RichContent, unix: number, format = '') {
  const query = `tg://time?unix=${unix}${format ? `&format=${format}` : ''}`

  return makeNode('inline', d =>
    d === 'markdown' ? `![${renderContent(label, d)}](${escapeMarkdownUrl(query)})` : `<tg-time unix="${unix}"${format ? ` format="${escape(format, 'html')}"` : ''}>${renderContent(label, d)}</tg-time>`)
}

/** in-document reference link to an anchor / `tg-reference` name */
export function reference (text: RichContent, name: string) {
  return link(text, `#${name}`)
}

/** an in-document anchor target, linkable via `reference(..., name)` */
export function anchor (name: string) {
  return makeNode('inline', _d => `<a name="${escape(name, 'html')}"></a>`)
}

/** footnote reference marker — pairs with a `footnote(id, …)` definition */
export function footnoteRef (id: string, label?: RichContent) {
  return makeNode('inline', d =>
    d === 'markdown'
      ? `[^${id}]`
      : `<a href="#${escape(id, 'html')}">${label === undefined ? escape(id, 'html') : renderContent(label, d)}</a>`)
}

/** alias for `strikethrough` */
export const strike = strikethrough
/** alias for `subscript` */
export const sub = subscript
/** alias for `superscript` */
export const sup = superscript
/** alias for `mentionUser` */
export const mention = mentionUser
/** alias for `customEmoji` */
export const emoji = customEmoji
/** alias for `footnoteRef` */
export const fnRef = footnoteRef
