import type { Formatted } from '../formatted'

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
