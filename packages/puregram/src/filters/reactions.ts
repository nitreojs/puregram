// reaction filters — match against `MessageReactionUpdate`'s `old_reaction` /
// `new_reaction` arrays. emoji form filters by `TelegramReactionTypeEmoji.emoji`;
// `paidReaction` flags any `TelegramReactionTypePaid` entry; the added/removed
// boolean filters compare list lengths between the two snapshots

import { defineFilter } from '@puregram/api'
import type { Filter, MessageReactionUpdate } from '@puregram/api'

const REACTION_KINDS = ['message_reaction'] as const

interface ReactionEntry {
  type?: string
  emoji?: string
}

interface ReactionRaw {
  raw?: {
    old_reaction?: ReactionEntry[]
    new_reaction?: ReactionEntry[]
  }
}

function readReactions (u: unknown) {
  const raw = (u as ReactionRaw).raw
  const oldReactions = raw?.old_reaction ?? []
  const newReactions = raw?.new_reaction ?? []

  return { oldReactions, newReactions }
}

/**
 * match `message_reaction` updates. when called with no arguments, matches any
 * update with at least one reaction in either `old_reaction` or `new_reaction`.
 * with emoji arguments (varargs or a single readonly array), matches when any
 * emoji-typed reaction in either snapshot uses one of the supplied emojis
 */
export function reaction (emojis: readonly string[]): Filter<MessageReactionUpdate>
export function reaction (...emojis: string[]): Filter<MessageReactionUpdate>
export function reaction (...args: [readonly string[]] | string[]) {
  const list = (args.length === 1 && Array.isArray(args[0]) ? args[0] : args) as readonly string[]

  if (list.length === 0) {
    return defineFilter(
      'reaction()',
      (u): u is MessageReactionUpdate => {
        const { oldReactions, newReactions } = readReactions(u)

        return oldReactions.length > 0 || newReactions.length > 0
      },
      { kinds: REACTION_KINDS }
    )
  }

  const set = new Set<string>(list)

  return defineFilter(
    `reaction(${list.join(', ')})`,
    (u): u is MessageReactionUpdate => {
      const { oldReactions, newReactions } = readReactions(u)

      for (const r of oldReactions) {
        if (r.type === 'emoji' && typeof r.emoji === 'string' && set.has(r.emoji)) {
          return true
        }
      }

      for (const r of newReactions) {
        if (r.type === 'emoji' && typeof r.emoji === 'string' && set.has(r.emoji)) {
          return true
        }
      }

      return false
    },
    { kinds: REACTION_KINDS }
  )
}

/**
 * match `message_reaction` updates that contain a paid-reaction entry in either
 * `old_reaction` or `new_reaction` (telegram stars reactions)
 */
export const paidReaction = defineFilter(
  'paidReaction',
  (u: unknown): u is MessageReactionUpdate => {
    const { oldReactions, newReactions } = readReactions(u)

    return oldReactions.some(r => r.type === 'paid') || newReactions.some(r => r.type === 'paid')
  },
  { kinds: REACTION_KINDS }
)

/**
 * match `message_reaction` updates where the user added at least one reaction
 * (`new_reaction.length > old_reaction.length`)
 */
export const reactionAdded = defineFilter(
  'reactionAdded',
  (u: unknown): u is MessageReactionUpdate => {
    const { oldReactions, newReactions } = readReactions(u)

    return newReactions.length > oldReactions.length
  },
  { kinds: REACTION_KINDS }
)

/**
 * match `message_reaction` updates where the user removed at least one reaction
 * (`old_reaction.length > new_reaction.length`)
 */
export const reactionRemoved = defineFilter(
  'reactionRemoved',
  (u: unknown): u is MessageReactionUpdate => {
    const { oldReactions, newReactions } = readReactions(u)

    return oldReactions.length > newReactions.length
  },
  { kinds: REACTION_KINDS }
)
