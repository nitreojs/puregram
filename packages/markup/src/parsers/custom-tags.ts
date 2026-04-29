import { MarkupParseError } from '../error'
import type { Formatted } from '../formatted'

import { parseAttrs } from './html'
import { canonicalTag, BUILT_IN_TAG_NAMES } from './html-tags'

/** maximum number of nested handler invocations before we throw to break a cycle */
export const MAX_DEPTH = 32

/** valid custom-tag names: lowercase, must start with a letter, may contain digits and dashes */
export const TAG_NAME_RE = /^[a-z][a-z0-9-]*$/

export interface TagInfo {
  tag: string
  attrs: Readonly<Record<string, string>>
  parent: string | null
  ancestors: readonly string[]
  index: number
  siblingCount: number
}

export type TagHandler = (content: Formatted, info: TagInfo) => Formatted

export type TagDefinitions = Readonly<Record<string, TagHandler>>

/**
 * applies `tags` onto `registry` in place. throws on:
 * - name collision with a built-in (`MarkupParseError`)
 * - invalid name shape (`MarkupParseError`)
 * - non-function handler (`TypeError`)
 *
 * second registration of the same custom name silently overwrites — useful for tests
 */
export function validateAndMerge (registry: Map<string, TagHandler>, tags: TagDefinitions) {
  for (const [name, handler] of Object.entries(tags)) {
    if (typeof handler !== 'function') {
      throw new TypeError(`custom-tag handler for <${name}> must be a function`)
    }

    if (BUILT_IN_TAG_NAMES.has(name)) {
      throw new MarkupParseError(`cannot redefine built-in tag <${name}>`, 0, `<${name}>`)
    }

    if (!TAG_NAME_RE.test(name)) {
      throw new MarkupParseError(`invalid custom-tag name '${name}'`, 0, `<${name}>`)
    }

    registry.set(name, handler)
  }
}

export interface CustomTagSpan {
  tag: string
  attrs: Readonly<Record<string, string>>
  openStart: number
  contentStart: number
  closeStart: number
  closeEnd: number
  selfClosing: boolean
}

// module-level counter; single-threaded by design (node event loop is single-threaded for sync code)
let handlerDepth = 0

/**
 * runs `handler` under the depth-tracking + error-wrapping discipline — all custom-tag
 * handler calls go through here. when `handlerDepth >= MAX_DEPTH` we throw before
 * invoking the handler, which catches both direct (`<h1>` → `<h1>`) and indirect
 * (`<a>` → `<b>` → `<a>`) cycles
 */
export function invokeHandler (handler: TagHandler, content: Formatted, info: TagInfo) {
  if (handlerDepth >= MAX_DEPTH) {
    throw new MarkupParseError(
      `custom-tag expansion depth exceeded (${MAX_DEPTH}); possible cycle in <${info.tag}>`,
      0,
      ''
    )
  }

  handlerDepth += 1

  try {
    return handler(content, info)
  } catch (err) {
    if (err instanceof MarkupParseError) {
      throw err
    }

    const message = err instanceof Error ? err.message : String(err)

    throw new MarkupParseError(
      `custom-tag <${info.tag}> handler threw: ${message}`,
      0,
      '',
      { cause: err }
    )
  } finally {
    handlerDepth -= 1
  }
}

/**
 * scans `source` for top-level custom-tag spans (those whose name is in `registry`).
 * spans nested inside other custom-tag spans are NOT returned at this level — they
 * are discovered when their parent's inner content is recursively scanned.
 *
 * built-in tags and sentinel sequences are skipped without inspection.
 */
export function scanCustomTags (
  source: string,
  registry: ReadonlyMap<string, TagHandler>
) {
  const spans: CustomTagSpan[] = []
  let i = 0

  while (i < source.length) {
    const ch = source[i]

    if (ch !== '<') {
      i += 1
      continue
    }

    // close tags at this scan level cannot belong to a top-level span we own,
    // so we skip past them and let parseHtml emit any stray-close error later
    if (source[i + 1] === '/') {
      const end = source.indexOf('>', i)

      if (end === -1) {
        i += 1
        continue
      }

      i = end + 1
      continue
    }

    const end = source.indexOf('>', i)

    if (end === -1) {
      // unclosed angle — let parseHtml emit its own error later
      i += 1
      continue
    }

    const inner = source.slice(i + 1, end).trim()
    const selfClosing = inner.endsWith('/')
    const innerNoSlash = selfClosing ? inner.slice(0, -1).trim() : inner
    const spaceIdx = innerNoSlash.search(/\s/)
    const rawName = (spaceIdx === -1 ? innerNoSlash : innerNoSlash.slice(0, spaceIdx)).toLowerCase()
    const canonical = canonicalTag(rawName)

    if (!registry.has(canonical)) {
      // not custom — skip past this open tag and keep scanning
      i = end + 1
      continue
    }

    const attrs = spaceIdx === -1 ? {} : parseAttrs(innerNoSlash.slice(spaceIdx))
    const openStart = i

    if (selfClosing) {
      spans.push({
        tag: canonical,
        attrs,
        openStart,
        contentStart: end + 1,
        closeStart: end + 1,
        closeEnd: end + 1,
        selfClosing: true
      })
      i = end + 1
      continue
    }

    // walk forward to find matching close, accounting for nested same-name opens
    const contentStart = end + 1
    let depth = 1
    let j = contentStart
    let matched = false

    while (j < source.length && depth > 0) {
      if (source[j] !== '<') {
        j += 1
        continue
      }

      const tagEnd = source.indexOf('>', j)

      if (tagEnd === -1) {
        break
      }

      const tagInner = source.slice(j + 1, tagEnd).trim()
      const isClose = tagInner.startsWith('/')
      const body = isClose ? tagInner.slice(1).trim() : tagInner
      const sp = body.search(/[\s/]/)
      const innerName = (sp === -1 ? body : body.slice(0, sp)).toLowerCase()
      const innerCanonical = canonicalTag(innerName)

      if (innerCanonical === canonical) {
        if (isClose) {
          depth -= 1

          if (depth === 0) {
            spans.push({
              tag: canonical,
              attrs,
              openStart,
              contentStart,
              closeStart: j,
              closeEnd: tagEnd + 1,
              selfClosing: false
            })
            i = tagEnd + 1
            matched = true
            break
          }
        } else if (!body.endsWith('/')) {
          // nested open of the same custom tag (skip self-closes — they don't add depth)
          depth += 1
        }
      }

      j = tagEnd + 1
    }

    if (!matched) {
      throw new MarkupParseError(`unclosed custom tag <${canonical}>`, openStart, source)
    }
  }

  return spans
}
