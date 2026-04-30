import type { Entity } from '../formatted'

/** canonical telegram html tag → entity type. alias resolution happens before this lookup */
export const TAG_TO_ENTITY: Readonly<Record<string, Entity['type']>> = {
  b: 'bold',
  i: 'italic',
  u: 'underline',
  s: 'strikethrough',
  'tg-spoiler': 'spoiler',
  a: 'text_link',
  code: 'code',
  pre: 'pre',
  blockquote: 'blockquote',
  'tg-emoji': 'custom_emoji',
  'tg-time': 'date_time',
  time: 'date_time'
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

/** all tag names that are reserved as built-ins (canonical + aliases + the spoiler-via-class span case) */
export const BUILT_IN_TAG_NAMES: ReadonlySet<string> = new Set([
  ...Object.keys(TAG_TO_ENTITY),
  ...Object.keys(TAG_ALIASES),
  'span'
])
