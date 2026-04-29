// chat-boost filters — match against `chat_boost` updates carrying a
// `TelegramChatBoostUpdated` payload. `boostCount(min?)` is parametric on a
// minimum cumulative count, but the bot-api `TelegramChatBoost` shape does not
// expose a count field of any kind; the parameter is accepted for forward
// compatibility and currently gates only on update kind. callers that need
// finer counting should reach into `update.raw` directly until the schema
// surfaces the field

import { defineFilter } from '@puregram/api'
import type { ChatBoostUpdate, Filter } from '@puregram/api'

const BOOST_KINDS = ['chat_boost'] as const

/**
 * match `chat_boost` updates. accepts an optional `min` argument reserved for a
 * future cumulative-count comparison — the current bot-api shape has no count
 * field on `TelegramChatBoost`, so any non-undefined `min` is accepted but
 * does not narrow the match further
 */
export function boostCount (min?: number): Filter<ChatBoostUpdate> {
  return defineFilter(
    min === undefined ? 'boostCount()' : `boostCount(${min})`,
    (u: unknown): u is ChatBoostUpdate =>
      (u as { raw?: { boost?: unknown } }).raw?.boost !== undefined,
    { kinds: BOOST_KINDS }
  )
}
