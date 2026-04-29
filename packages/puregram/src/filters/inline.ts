// inline-query filters — match against `inline_query.query` and the
// `result_id` field of `chosen_inline_result` updates. value form is exact
// equality, regex form attaches the match as `update.match`

import { defineFilter } from '@puregram/api'
import type { ChosenInlineResultUpdate, Filter, InlineQueryUpdate } from '@puregram/api'

import { attach } from '../dispatch/attach'

const INLINE_QUERY_KINDS = ['inline_query'] as const
const CHOSEN_INLINE_RESULT_KINDS = ['chosen_inline_result'] as const

/**
 * match against `update.raw.query` for inline-query updates. string form is
 * exact equality; regex form runs the pattern and attaches `update.match`
 */
export function inlineQuery (value: string): Filter<InlineQueryUpdate>
export function inlineQuery (pattern: RegExp): Filter<InlineQueryUpdate>
export function inlineQuery (value: string | RegExp): Filter<InlineQueryUpdate> {
  if (typeof value === 'string') {
    return defineFilter(
      `inlineQuery(${value})`,
      (u: unknown): u is InlineQueryUpdate =>
        (u as { raw?: { query?: unknown } }).raw?.query === value,
      { kinds: INLINE_QUERY_KINDS }
    )
  }

  const pattern = value

  return defineFilter(
    `inlineQuery(${pattern.toString()})`,
    (u: unknown): u is InlineQueryUpdate => {
      const query = (u as { raw?: { query?: unknown } }).raw?.query

      if (typeof query !== 'string') {
        return false
      }

      const result = pattern.exec(query)

      if (result === null) {
        return false
      }

      attach(u as object, 'match', result)

      return true
    },
    { kinds: INLINE_QUERY_KINDS }
  )
}

/**
 * match against `update.raw.result_id` for chosen-inline-result updates.
 * string form is exact equality; regex form attaches `update.match`
 */
export function chosenInlineResult (value: string): Filter<ChosenInlineResultUpdate>
export function chosenInlineResult (pattern: RegExp): Filter<ChosenInlineResultUpdate>
export function chosenInlineResult (value: string | RegExp): Filter<ChosenInlineResultUpdate> {
  if (typeof value === 'string') {
    return defineFilter(
      `chosenInlineResult(${value})`,
      (u: unknown): u is ChosenInlineResultUpdate =>
        (u as { raw?: { result_id?: unknown } }).raw?.result_id === value,
      { kinds: CHOSEN_INLINE_RESULT_KINDS }
    )
  }

  const pattern = value

  return defineFilter(
    `chosenInlineResult(${pattern.toString()})`,
    (u: unknown): u is ChosenInlineResultUpdate => {
      const id = (u as { raw?: { result_id?: unknown } }).raw?.result_id

      if (typeof id !== 'string') {
        return false
      }

      const result = pattern.exec(id)

      if (result === null) {
        return false
      }

      attach(u as object, 'match', result)

      return true
    },
    { kinds: CHOSEN_INLINE_RESULT_KINDS }
  )
}
