import type { CallbackQueryUpdate, MessageUpdate, UpdateKindMap } from '@puregram/api'

import type { Filter, WaitForOptions } from './types'

/**
 * build a filter that matches messages starting with `/name` (optionally
 * `/name@bot` or `/name <args>`) when `name` is a string, or whose text matches
 * `name` directly when it's a RegExp. case-insensitive for the string form
 */
export function buildCommandFilter (name: string | RegExp) {
  if (name instanceof RegExp) {
    const filter: Filter<MessageUpdate> = (m) => {
      const text = m.text ?? m.caption

      return text !== undefined && name.test(text)
    }

    return filter
  }

  const trimmed = name.startsWith('/') ? name.slice(1) : name
  const pattern = new RegExp(`^\\/${escapeRegex(trimmed)}(?:@\\w+)?(?:\\s|$)`, 'i')

  const filter: Filter<MessageUpdate> = (m) => {
    const text = m.text ?? m.caption

    return text !== undefined && pattern.test(text)
  }

  return filter
}

/**
 * compose a callback-query predicate with an existing waitFor filter, so the
 * sugar layer plays nicely with the augment middleware's auto-scope filter
 */
export function composeCallbackPredicate (
  predicate: ((q: CallbackQueryUpdate) => boolean) | undefined,
  extra: Filter<CallbackQueryUpdate> | undefined
) {
  if (predicate === undefined && extra === undefined) {
    return undefined
  }

  if (predicate === undefined) {
    return extra
  }

  if (extra === undefined) {
    return predicate
  }

  const composed: Filter<CallbackQueryUpdate> = q => predicate(q) && extra(q)

  return composed
}

/** same shape as `composeCallbackPredicate` but for `MessageUpdate` */
export function composeMessageFilter (
  primary: Filter<MessageUpdate>,
  extra: Filter<MessageUpdate> | undefined
) {
  if (extra === undefined) {
    return primary
  }

  const composed: Filter<MessageUpdate> = m => primary(m) && extra(m)

  return composed
}

/**
 * derive the full WaitForOptions object from a sugar call, splicing the
 * pre-built filter into the user-supplied options without dropping `signal`,
 * `timeout`, `validate`, etc.
 */
export function withFilter<K extends 'message' | 'callback_query'> (
  options: WaitForOptions<K> | undefined,
  filter: Filter<UpdateKindMap[K]> | undefined
) {
  const base: WaitForOptions<K> = options !== undefined ? { ...options } : {}

  if (filter !== undefined) {
    base.filter = filter
  }

  return base
}

function escapeRegex (s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
