import { MarkupParseError } from '../error'
import type { Formatted } from '../formatted'

import { BUILT_IN_TAG_NAMES } from './html-tags'

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
