// markdown specials. `&` `<` `>` become html entities (rich-markdown renders `\<` with the
// backslash showing, but accepts entities); the rest backslash-escape cleanly
const MD_SPECIALS = /[&<>\\`*_~=|[\]()#!+-]/g
const MD_ENTITY: Record<string, string> = { '&': '&#38;', '<': '&#60;', '>': '&#62;' }

/** escape interpolated text so it renders literally in rich-markdown */
export function escapeMarkdown (text: string) {
  return text.replace(MD_SPECIALS, ch => MD_ENTITY[ch] ?? `\\${ch}`)
}

const HTML_SPECIALS: Record<string, string> = {
  '&': '&#38;',
  '<': '&#60;',
  '>': '&#62;',
  '"': '&#34;'
}

/** numeric-entity-escape the structural html chars (numeric entities are always supported) */
export function escapeHtml (text: string) {
  return text.replace(/[&<>"]/g, ch => HTML_SPECIALS[ch] as string)
}

// a url inside markdown `[text](url)` is terminated by `)` or whitespace — escape the parens and
// backslash, percent-encode whitespace, so an attacker-controlled url can't break out of the link
export function escapeMarkdownUrl (url: string) {
  return url.replace(/[\\()]/g, '\\$&').replace(/\s/g, encodeURIComponent)
}
