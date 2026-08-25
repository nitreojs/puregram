import { lookupTable } from './table'

/** the only named entities telegram's rich dialects accept — everything else must be numeric */
export const NAMED_ENTITIES = lookupTable<string>({
  lt: '<',
  gt: '>',
  amp: '&',
  quot: '"',
  apos: "'",
  nbsp: '\u00a0',
  hellip: '\u2026',
  mdash: '\u2014',
  ndash: '\u2013',
  lsquo: '\u2018',
  rsquo: '\u2019',
  ldquo: '\u201c',
  rdquo: '\u201d'
})
