// inline + block markdown specials that could inject formatting if user text were spliced raw.
// `>` `#` `-` `+` are block markers only at line start, but escaping them everywhere is harmless
const MD_SPECIALS = /[\\`*_~=|[\]()#>!+\-<]/g

/** backslash-escape rich-markdown specials so interpolated text renders literally */
export function escapeMarkdown (text: string) {
  return text.replace(MD_SPECIALS, '\\$&')
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
