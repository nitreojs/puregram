import { MarkupParseError } from '../error'
import { type Entity, Formatted } from '../formatted'

import { composeWithSentinels, expandSentinels, isTemplateStringsArray } from './sentinel'

const ESCAPABLE = new Set(['\\', '`', '*', '_', '~', '|', '[', ']', '(', ')', '>'])

interface State {
  src: string
  pos: number
  text: string
  entities: Entity[]
}

function fail (s: State, msg: string, at = s.pos): never {
  throw new MarkupParseError(msg, at, s.src)
}

function startsWith (s: State, str: string): boolean {
  return s.src.startsWith(str, s.pos)
}

interface Delim {
  open: string
  type: string
}

// ordered: longer delimiters first so we match ** before *, __ before _, etc
const DELIMITERS: readonly Delim[] = [
  { open: '**', type: 'bold' },
  { open: '__', type: 'underline' },
  { open: '~~', type: 'strikethrough' },
  { open: '||', type: 'spoiler' },
  { open: '_', type: 'italic' },
  { open: '*', type: 'italic' },
  { open: '~', type: 'strikethrough' }
]

function matchDelim (s: State): Delim | null {
  for (const d of DELIMITERS) {
    if (startsWith(s, d.open)) {
      return d
    }
  }

  return null
}

function parseInline (s: State, stopAt: string | null): void {
  while (s.pos < s.src.length) {
    if (stopAt !== null && startsWith(s, stopAt)) {
      return
    }

    const ch = s.src[s.pos]!

    if (ch === '\n' && stopAt === null) {
      // inline parser on a single line — let block-level handle newlines
      return
    }

    if (ch === '\\') {
      const next = s.src[s.pos + 1]

      if (next !== undefined && ESCAPABLE.has(next)) {
        s.text += next
        s.pos += 2
        continue
      }

      s.text += '\\'
      s.pos += 1
      continue
    }

    if (ch === '`') {
      parseInlineCode(s)
      continue
    }

    if (ch === '[') {
      parseLink(s)
      continue
    }

    const delim = matchDelim(s)

    if (delim !== null) {
      parseFramed(s, delim)
      continue
    }

    s.text += ch
    s.pos += 1
  }
}

function parseFramed (s: State, delim: Delim): void {
  const start = s.text.length
  const openPos = s.pos

  s.pos += delim.open.length
  parseInline(s, delim.open)

  if (!startsWith(s, delim.open)) {
    fail(s, `unmatched ${delim.open}`, openPos)
  }

  s.pos += delim.open.length
  s.entities.push({ type: delim.type, offset: start, length: s.text.length - start })
}

function parseInlineCode (s: State): void {
  const openPos = s.pos
  const start = s.text.length

  s.pos += 1

  while (s.pos < s.src.length && s.src[s.pos] !== '`') {
    if (s.src[s.pos] === '\\' && s.src[s.pos + 1] !== undefined) {
      const next = s.src[s.pos + 1]!

      if (next === '`' || next === '\\') {
        s.text += next
        s.pos += 2
        continue
      }
    }

    s.text += s.src[s.pos]!
    s.pos += 1
  }

  if (s.src[s.pos] !== '`') {
    fail(s, 'unmatched `', openPos)
  }

  s.pos += 1
  s.entities.push({ type: 'code', offset: start, length: s.text.length - start })
}

function parseLink (s: State): void {
  const openPos = s.pos
  const start = s.text.length

  s.pos += 1
  parseInline(s, ']')

  if (s.src[s.pos] !== ']' || s.src[s.pos + 1] !== '(') {
    fail(s, 'malformed link — expected ](', openPos)
  }

  s.pos += 2

  const close = s.src.indexOf(')', s.pos)

  if (close === -1) {
    fail(s, 'malformed link — missing )', openPos)
  }

  const url = s.src.slice(s.pos, close)

  s.pos = close + 1

  if (url.startsWith('tg://user?id=')) {
    const id = parseInt(url.slice('tg://user?id='.length), 10)

    if (Number.isNaN(id)) {
      fail(s, 'malformed tg://user url', openPos)
    }

    s.entities.push({
      type: 'text_mention',
      offset: start,
      length: s.text.length - start,
      user: { id, first_name: s.text.slice(start), is_bot: false }
    })

    return
  }

  s.entities.push({ type: 'text_link', offset: start, length: s.text.length - start, url })
}

/** parses our MarkdownV2-flavored dialect into a Formatted */
export function parseMarkdown (src: string): Formatted {
  const s: State = { src, pos: 0, text: '', entities: [] }
  const lines = src.split('\n')
  let i = 0

  const advanceTo = (lineStart: number) => {
    s.pos = lineStart
  }

  // precompute line-start offsets
  const lineStarts: number[] = [0]

  for (let p = 0; p < src.length; p++) {
    if (src[p] === '\n') {
      lineStarts.push(p + 1)
    }
  }

  while (i < lines.length) {
    const line = lines[i]!
    const lineStart = lineStarts[i]!

    advanceTo(lineStart)

    // pre-fenced code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const fenceStart = lineStart

      i += 1

      const buf: string[] = []

      while (i < lines.length && !lines[i]!.startsWith('```')) {
        buf.push(lines[i]!)
        i += 1
      }

      if (i >= lines.length) {
        fail(s, 'unmatched ```', fenceStart)
      }

      i += 1

      const preText = buf.join('\n')

      if (s.text.length > 0 && !s.text.endsWith('\n')) {
        s.text += '\n'
      }

      const preStart = s.text.length

      s.text += preText

      const entity: Entity = { type: 'pre', offset: preStart, length: preText.length }

      if (lang !== '') {
        entity.language = lang
      }

      s.entities.push(entity)
      continue
    }

    if (line.startsWith('>>')) {
      const start = s.text.length

      if (s.text.length > 0 && !s.text.endsWith('\n')) {
        s.text += '\n'
      }

      const innerLines: string[] = []

      while (i < lines.length && lines[i]!.startsWith('>>')) {
        innerLines.push(lines[i]!.slice(2).replace(/^ /, ''))
        i += 1
      }

      const inner = innerLines.join('\n')
      const innerState: State = { src: inner, pos: 0, text: '', entities: [] }

      parseBlockContent(innerState)

      const offsetShift = s.text.length

      s.text += innerState.text

      for (const e of innerState.entities) {
        s.entities.push({ ...e, offset: e.offset + offsetShift })
      }

      s.entities.push({ type: 'expandable_blockquote', offset: start, length: s.text.length - start })
      continue
    }

    if (line.startsWith('>')) {
      const start = s.text.length

      if (s.text.length > 0 && !s.text.endsWith('\n')) {
        s.text += '\n'
      }

      const innerLines: string[] = []

      while (i < lines.length && lines[i]!.startsWith('>') && !lines[i]!.startsWith('>>')) {
        innerLines.push(lines[i]!.slice(1).replace(/^ /, ''))
        i += 1
      }

      const inner = innerLines.join('\n')
      const innerState: State = { src: inner, pos: 0, text: '', entities: [] }

      parseBlockContent(innerState)

      const offsetShift = s.text.length

      s.text += innerState.text

      for (const e of innerState.entities) {
        s.entities.push({ ...e, offset: e.offset + offsetShift })
      }

      s.entities.push({ type: 'blockquote', offset: start, length: s.text.length - start })
      continue
    }

    // ordinary line — append to text with line separator if needed
    if (i > 0 && s.text.length > 0 && !s.text.endsWith('\n')) {
      s.text += '\n'
    }

    const lineState: State = { src: line, pos: 0, text: s.text, entities: s.entities }

    parseInline(lineState, null)

    s.text = lineState.text
    s.entities = lineState.entities
    i += 1
  }

  s.entities.sort((a, b) => a.offset - b.offset)

  return new Formatted(s.text, s.entities)
}

// recurses into blockquote bodies — handles inline content with embedded \n
function parseBlockContent (s: State): void {
  while (s.pos < s.src.length) {
    parseInline(s, null)

    if (s.src[s.pos] === '\n') {
      s.text += '\n'
      s.pos += 1
    }
  }
}

const RE_SPECIALS = /[.*+?^${}()|[\]\\]/g

function escapeForRegExp (s: string): string {
  return s.replace(RE_SPECIALS, '\\$&')
}

function detectFirstIndent (strings: TemplateStringsArray): string | null {
  const first = strings[0] ?? ''

  if (!first.startsWith('\n')) {
    return null
  }

  const m = first.match(/^\n([ \t]+)/)

  return m === null ? '' : m[1]!
}

function mdTagged (strings: TemplateStringsArray, rest: readonly unknown[]): Formatted {
  const indent = detectFirstIndent(strings)
  let firstSeen = false

  const transform = (s: string): string => {
    let out = s

    if (!firstSeen) {
      firstSeen = true

      if (indent !== null) {
        out = out.startsWith('\n') ? out.slice(1) : out

        if (indent !== '' && out.startsWith(indent)) {
          out = out.slice(indent.length)
        }
      }
    }

    if (indent !== null && indent !== '') {
      out = out.replace(new RegExp(`\\n${escapeForRegExp(indent)}`, 'g'), '\n')
    }

    return out
  }

  const segments = Array.from(strings) as string[]

  if (indent !== null && segments.length > 0) {
    const last = segments.length - 1
    segments[last] = segments[last]!.replace(/\n[ \t]*$/, '')
  }

  // composeWithSentinels expects a TemplateStringsArray-shaped object; it only
  // reads .length and integer indices, so a plain array is acceptable
  const { source, slots } = composeWithSentinels(segments as unknown as TemplateStringsArray, rest, transform)
  const parsed = parseMarkdown(source)

  return expandSentinels(parsed, slots)
}

/** parses our MarkdownV2-flavored dialect. accepts both function-call form and tagged-template form */
export function md (source: string): Formatted
export function md (strings: TemplateStringsArray, ...rest: readonly unknown[]): Formatted
export function md (first: string | TemplateStringsArray, ...rest: readonly unknown[]): Formatted {
  if (isTemplateStringsArray(first)) {
    return mdTagged(first, rest)
  }

  return parseMarkdown(first)
}

/** alias for {@link md} */
export const markdown = md
