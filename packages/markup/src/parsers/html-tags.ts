/** canonical telegram html tag → entity type. alias resolution happens before this lookup */
export const TAG_TO_ENTITY: Readonly<Record<string, string>> = {
  b: 'bold',
  i: 'italic',
  u: 'underline',
  s: 'strikethrough',
  'tg-spoiler': 'spoiler',
  a: 'text_link',
  code: 'code',
  pre: 'pre',
  blockquote: 'blockquote',
  'tg-emoji': 'custom_emoji'
}

/** alias tag → canonical tag */
export const TAG_ALIASES: Readonly<Record<string, string>> = {
  strong: 'b',
  em: 'i',
  italic: 'i',
  ins: 'u',
  strike: 's',
  del: 's',
  spoiler: 'tg-spoiler',
  emoji: 'tg-emoji'
}

/** resolves an alias tag to its canonical form (lowercased) */
export function canonicalTag (tag: string) {
  const lower = tag.toLowerCase()

  return TAG_ALIASES[lower] ?? lower
}
