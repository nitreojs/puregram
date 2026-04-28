import { MarkupParseError } from '../error'
import { type Entity, Formatted } from '../formatted'

import { TAG_TO_ENTITY, canonicalTag } from './html-tags'

interface OpenTag {
  canonical: string
  attrs: Record<string, string>
  startOffset: number
  sourceOffset: number
}

const ENTITY_REFS: Readonly<Record<string, string>> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' '
}

function decodeEntity (raw: string, sourceOffset: number, source: string): string {
  if (raw.startsWith('#x') || raw.startsWith('#X')) {
    const code = parseInt(raw.slice(2), 16)

    if (Number.isNaN(code)) {
      throw new MarkupParseError(`malformed numeric entity &${raw};`, sourceOffset, source)
    }

    return String.fromCodePoint(code)
  }

  if (raw.startsWith('#')) {
    const code = parseInt(raw.slice(1), 10)

    if (Number.isNaN(code)) {
      throw new MarkupParseError(`malformed numeric entity &${raw};`, sourceOffset, source)
    }

    return String.fromCodePoint(code)
  }

  const value = ENTITY_REFS[raw]

  if (value === undefined) {
    throw new MarkupParseError(`unknown HTML entity &${raw};`, sourceOffset, source)
  }

  return value
}

const ATTR_RE = /\s*([a-zA-Z][a-zA-Z0-9-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g

function parseAttrs (attrSrc: string): Record<string, string> {
  const attrs: Record<string, string> = {}

  ATTR_RE.lastIndex = 0
  let m: RegExpExecArray | null

  while ((m = ATTR_RE.exec(attrSrc)) !== null) {
    const name = m[1]!.toLowerCase()
    const value = m[2] ?? m[3] ?? m[4] ?? ''

    attrs[name] = value
  }

  return attrs
}

function buildEntity (tag: OpenTag, length: number, source: string): Entity {
  const canonical = tag.canonical
  const type = TAG_TO_ENTITY[canonical]

  if (type === undefined) {
    throw new MarkupParseError(`unknown tag <${canonical}>`, tag.sourceOffset, source)
  }

  const entity: Entity = { type, offset: tag.startOffset, length }

  if (canonical === 'a') {
    const url = tag.attrs['href']

    if (url === undefined) {
      throw new MarkupParseError('<a> requires an href attribute', tag.sourceOffset, source)
    }

    entity.url = url
  }

  if (canonical === 'tg-emoji') {
    const id = tag.attrs['emoji-id'] ?? tag.attrs['id']

    if (id === undefined) {
      throw new MarkupParseError('<tg-emoji> requires an emoji-id (or id) attribute', tag.sourceOffset, source)
    }

    entity.custom_emoji_id = id
  }

  if (canonical === 'blockquote' && 'expandable' in tag.attrs) {
    entity.type = 'expandable_blockquote'
  }

  if (canonical === 'pre' && tag.attrs['language'] !== undefined) {
    entity.language = tag.attrs['language']
  }

  return entity
}

function isSpoilerSpan (rawName: string, attrs: Record<string, string>): boolean {
  return rawName === 'span' && (attrs['class'] ?? '').split(/\s+/).includes('tg-spoiler')
}

/** parses raw HTML source into a Formatted */
export function parseHtml (source: string): Formatted {
  let text = ''
  const entities: Entity[] = []
  const stack: OpenTag[] = []
  let i = 0

  // appends a character to `text` while collapsing whitespace runs to a single space.
  // skips leading whitespace; trailing whitespace stripped after the loop
  const appendText = (s: string) => {
    for (const ch of s) {
      if (/\s/.test(ch)) {
        if (text !== '' && !text.endsWith(' ')) {
          text += ' '
        }
      } else {
        text += ch
      }
    }
  }

  while (i < source.length) {
    const ch = source[i]!

    if (ch === '<') {
      if (source[i + 1] === '/') {
        const end = source.indexOf('>', i)

        if (end === -1) {
          throw new MarkupParseError('unclosed </…>', i, source)
        }

        const rawName = source.slice(i + 2, end).trim()
        const canonical = canonicalTag(rawName)
        const open = stack.pop()

        if (open === undefined) {
          throw new MarkupParseError(`stray closing tag </${rawName}>`, i, source)
        }

        // pre>code: transfer language attribute up to the outer <pre> and discard inner <code>
        if (open.canonical === 'code' && stack.length > 0 && stack[stack.length - 1]!.canonical === 'pre') {
          const lang = (open.attrs['class'] ?? '').match(/language-([\w-]+)/)?.[1]

          if (lang !== undefined) {
            stack[stack.length - 1]!.attrs['language'] = lang
          }

          if (open.canonical !== canonical) {
            throw new MarkupParseError(`mismatched closing tag </${rawName}> (expected </${open.canonical}>)`, i, source)
          }

          i = end + 1
          continue
        }

        const matchAllowed = open.canonical === canonical
          || (open.canonical === 'tg-spoiler' && (canonical === 'span' || canonical === 'tg-spoiler' || canonical === 'spoiler'))

        if (!matchAllowed) {
          throw new MarkupParseError(`mismatched closing tag </${rawName}> (expected </${open.canonical}>)`, i, source)
        }

        const length = text.length - open.startOffset
        const entity = buildEntity(open, length, source)

        entities.push(entity)

        i = end + 1
        continue
      }

      const end = source.indexOf('>', i)

      if (end === -1) {
        throw new MarkupParseError('unclosed <…>', i, source)
      }

      const inner = source.slice(i + 1, end).trim()
      const spaceIdx = inner.search(/[\s/]/)
      const rawName = (spaceIdx === -1 ? inner : inner.slice(0, spaceIdx)).toLowerCase()
      const attrs = spaceIdx === -1 ? {} : parseAttrs(inner.slice(spaceIdx))
      let canonical = canonicalTag(rawName)

      if (isSpoilerSpan(rawName, attrs)) {
        canonical = 'tg-spoiler'
      }

      stack.push({ canonical, attrs, startOffset: text.length, sourceOffset: i })

      i = end + 1
      continue
    }

    if (ch === '&') {
      const semi = source.indexOf(';', i)

      if (semi === -1 || semi - i > 12) {
        appendText('&')
        i += 1
        continue
      }

      const raw = source.slice(i + 1, semi)

      appendText(decodeEntity(raw, i, source))
      i = semi + 1
      continue
    }

    appendText(ch)
    i += 1
  }

  if (stack.length > 0) {
    const top = stack[stack.length - 1]!

    throw new MarkupParseError(`unclosed tag <${top.canonical}>`, top.sourceOffset, source)
  }

  // strip a single trailing space (leading was already skipped during accumulation)
  if (text.endsWith(' ')) {
    text = text.slice(0, -1)
  }

  entities.sort((a, b) => a.offset - b.offset)

  return new Formatted(text, entities)
}

/** parses telegram html (function-call form). tagged-template form is added separately */
export function html (source: string): Formatted {
  return parseHtml(source)
}
