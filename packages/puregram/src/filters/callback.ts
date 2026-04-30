// callback-query filters — match against the `data` and `game_short_name`
// fields of `callback_query` updates. value form is exact equality, regex form
// runs the pattern and attaches `match` for named-capture access in handlers

import { defineFilter } from '@puregram/api'
import type { CallbackQueryUpdate, Filter } from '@puregram/api'

import { attach } from '../dispatch/attach'

const CALLBACK_KINDS = ['callback_query'] as const

/**
 * match against `update.raw.data`. string form is exact equality; regex form
 * runs the pattern against the data string and attaches `update.match`
 */
export function callbackData (value: string): Filter<CallbackQueryUpdate, { raw: { data: string } }>
export function callbackData (pattern: RegExp): Filter<
  CallbackQueryUpdate,
  { raw: { data: string }, match: RegExpMatchArray }
>
export function callbackData (value: string | RegExp) {
  if (typeof value === 'string') {
    return defineFilter<CallbackQueryUpdate, { raw: { data: string } }>(
      `callbackData(${value})`,
      (u): u is CallbackQueryUpdate =>
        (u as { raw?: { data?: unknown } }).raw?.data === value,
      { kinds: CALLBACK_KINDS }
    )
  }

  const pattern = value

  return defineFilter<CallbackQueryUpdate, { raw: { data: string }, match: RegExpMatchArray }>(
    `callbackData(${pattern.toString()})`,
    (u): u is CallbackQueryUpdate => {
      const data = (u as { raw?: { data?: unknown } }).raw?.data

      if (typeof data !== 'string') {
        return false
      }

      const result = pattern.exec(data)

      if (result === null) {
        return false
      }

      attach(u as object, 'match', result)

      return true
    },
    { kinds: CALLBACK_KINDS }
  )
}

/**
 * match against `update.raw.game_short_name` for callback queries originating
 * from a game-button press. string form is exact equality; regex form attaches
 * the resulting match as `update.match`
 */
export function callbackGameShortName (
  value: string
): Filter<CallbackQueryUpdate, { raw: { game_short_name: string } }>
export function callbackGameShortName (
  pattern: RegExp
): Filter<CallbackQueryUpdate, { raw: { game_short_name: string }, match: RegExpMatchArray }>
export function callbackGameShortName (value: string | RegExp) {
  if (typeof value === 'string') {
    return defineFilter<CallbackQueryUpdate, { raw: { game_short_name: string } }>(
      `callbackGameShortName(${value})`,
      (u): u is CallbackQueryUpdate =>
        (u as { raw?: { game_short_name?: unknown } }).raw?.game_short_name === value,
      { kinds: CALLBACK_KINDS }
    )
  }

  const pattern = value

  return defineFilter<CallbackQueryUpdate, { raw: { game_short_name: string }, match: RegExpMatchArray }>(
    `callbackGameShortName(${pattern.toString()})`,
    (u): u is CallbackQueryUpdate => {
      const name = (u as { raw?: { game_short_name?: unknown } }).raw?.game_short_name

      if (typeof name !== 'string') {
        return false
      }

      const result = pattern.exec(name)

      if (result === null) {
        return false
      }

      attach(u as object, 'match', result)

      return true
    },
    { kinds: CALLBACK_KINDS }
  )
}
