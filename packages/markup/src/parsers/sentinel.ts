import { type Entity, Formatted } from '../formatted'
import { interpolate, type Piece } from '../interpolate'

// SOH (0x01) is parsed verbatim by both html and markdown lexers (it is neither
// whitespace nor any special syntax char), so we use it to delimit slot indices
const SENTINEL_DELIM = '\u0001'

export const SENTINEL_PREFIX = SENTINEL_DELIM
export const SENTINEL_SUFFIX = SENTINEL_DELIM

const SENTINEL_RE = new RegExp(`${SENTINEL_DELIM}(\\d+)${SENTINEL_DELIM}`, 'g')

export function isTemplateStringsArray (value: unknown): value is TemplateStringsArray {
  return Array.isArray(value) && Array.isArray((value as unknown as { raw?: unknown }).raw)
}

export function pieceFromInterp (value: unknown): Piece {
  if (value === null || value === undefined || value === false) {
    return { kind: 'skip' }
  }

  if (typeof value === 'string') {
    return { kind: 'text', value }
  }

  if (typeof value === 'number') {
    return { kind: 'text', value: String(value) }
  }

  return { kind: 'formatted', value: Formatted.from(value as Formatted | { text: string, entities?: readonly Entity[] }) }
}

interface SentinelHit {
  start: number     // start offset in parsed text
  length: number    // length of the sentinel in parsed text
  slot: Piece       // resolved slot
  newStart: number  // start offset in output text (computed during build)
  newLength: number // length in output text
}

/**
 * resolves sentinels embedded in parsed `Formatted` back into their original
 * interpolated values. each entity's offset/length is shifted to account for
 * the size delta between its sentinel placeholder and the actual emitted text.
 */
export function expandSentinels (parsed: Formatted, slots: readonly Piece[]): Formatted {
  const text = parsed.text

  // collect all sentinel hits, in order
  const hits: SentinelHit[] = []
  SENTINEL_RE.lastIndex = 0
  let m: RegExpExecArray | null

  while ((m = SENTINEL_RE.exec(text)) !== null) {
    const slotIdx = parseInt(m[1]!, 10)
    const slot = slots[slotIdx]

    if (slot === undefined) continue

    const sub = interpolate([slot])

    hits.push({
      start: m.index,
      length: m[0].length,
      slot,
      newStart: 0,
      newLength: sub.text.length
    })
  }

  // build the output text by splicing each slot's text in place of its sentinel
  let outText = ''
  let cursor = 0

  for (const hit of hits) {
    outText += text.slice(cursor, hit.start)
    hit.newStart = outText.length
    const sub = interpolate([hit.slot])
    outText += sub.text
    cursor = hit.start + hit.length
  }

  outText += text.slice(cursor)

  // shift entities from the parsed text
  const outEntities: Entity[] = []

  for (const e of parsed.entities) {
    let newOffset = e.offset
    let newLength = e.length

    for (const hit of hits) {
      const hitEnd = hit.start + hit.length
      const eEnd = e.offset + e.length
      const delta = hit.newLength - hit.length

      if (hitEnd <= e.offset) {
        // sentinel fully before entity → shift entity start
        newOffset += delta
      } else if (hit.start >= eEnd) {
        // sentinel fully after entity → no effect
      } else {
        // sentinel within (or overlapping) entity range → adjust length
        newLength += delta
      }
    }

    outEntities.push({ ...e, offset: newOffset, length: newLength })
  }

  // splice in entities from each slot's Formatted, anchored at its newStart
  for (const hit of hits) {
    if (hit.slot.kind !== 'formatted') continue

    for (const e of hit.slot.value.entities) {
      outEntities.push({ ...e, offset: e.offset + hit.newStart })
    }
  }

  outEntities.sort((a, b) => a.offset - b.offset)

  return new Formatted(outText, outEntities)
}

/** builds a sentinel-laden source string from a tagged-template invocation */
export function composeWithSentinels (
  strings: TemplateStringsArray,
  rest: readonly unknown[],
  transformLiteral: (s: string) => string = s => s
): { source: string, slots: Piece[] } {
  const slots = rest.map(pieceFromInterp)
  let source = transformLiteral(strings[0] ?? '')

  for (let i = 1; i < strings.length; i++) {
    source += `${SENTINEL_PREFIX}${i - 1}${SENTINEL_SUFFIX}`
    source += transformLiteral(strings[i] ?? '')
  }

  return { source, slots }
}
