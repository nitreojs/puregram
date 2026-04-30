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
export function inlineQuery (value: string): Filter<InlineQueryUpdate, { query: string }>
export function inlineQuery (
  pattern: RegExp
): Filter<InlineQueryUpdate, { raw: { query: string }, match: RegExpMatchArray }>
export function inlineQuery (value: string | RegExp) {
  if (typeof value === 'string') {
    return defineFilter<InlineQueryUpdate, { query: string }>(
      `inlineQuery(${value})`,
      (u): u is InlineQueryUpdate =>
        (u as { raw?: { query?: unknown } }).raw?.query === value,
      { kinds: INLINE_QUERY_KINDS }
    )
  }

  const pattern = value

  return defineFilter<InlineQueryUpdate, { raw: { query: string }, match: RegExpMatchArray }>(
    `inlineQuery(${pattern.toString()})`,
    (u): u is InlineQueryUpdate => {
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
export function chosenInlineResult (
  value: string
): Filter<ChosenInlineResultUpdate, { resultId: string }>
export function chosenInlineResult (
  pattern: RegExp
): Filter<ChosenInlineResultUpdate, { raw: { result_id: string }, match: RegExpMatchArray }>
export function chosenInlineResult (value: string | RegExp) {
  if (typeof value === 'string') {
    return defineFilter<ChosenInlineResultUpdate, { resultId: string }>(
      `chosenInlineResult(${value})`,
      (u): u is ChosenInlineResultUpdate =>
        (u as { raw?: { result_id?: unknown } }).raw?.result_id === value,
      { kinds: CHOSEN_INLINE_RESULT_KINDS }
    )
  }

  const pattern = value

  return defineFilter<ChosenInlineResultUpdate, { raw: { result_id: string }, match: RegExpMatchArray }>(
    `chosenInlineResult(${pattern.toString()})`,
    (u): u is ChosenInlineResultUpdate => {
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
