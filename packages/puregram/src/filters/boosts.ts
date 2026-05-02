import { defineFilter } from '@puregram/api'
import type { ChatBoost, ChatBoostUpdate, Filter } from '@puregram/api'

const BOOST_KINDS = ['chat_boost'] as const

/**
 * match `chat_boost` updates. `min` is reserved for a future cumulative-count
 * comparison — bot-api currently exposes no count field, so it doesn't narrow
 */
export function boostCount (min?: number): Filter<ChatBoostUpdate, { boost: ChatBoost }> {
  return defineFilter<ChatBoostUpdate, { boost: ChatBoost }>(
    min === undefined ? 'boostCount()' : `boostCount(${min})`,
    (u): u is ChatBoostUpdate =>
      (u as { raw?: { boost?: unknown } }).raw?.boost !== undefined,
    { kinds: BOOST_KINDS }
  )
}
