// chat-member transition filters — derive a change type from the
// `old_chat_member.status` -> `new_chat_member.status` transition table on
// `ChatMemberUpdate` and `MyChatMemberUpdate`. mirrors the rules already
// codified by the codegen'd `didJoinChat`/`wasPromoted`/etc helpers on the
// update classes themselves; see `CHAT_MEMBER_EXTRAS` in the api emitter

import { defineFilter } from '@puregram/api'
import type { ChatMemberUpdate, Filter, MyChatMemberUpdate } from '@puregram/api'

type ChatMemberBearingUpdate = ChatMemberUpdate | MyChatMemberUpdate

const CHAT_MEMBER_KINDS = ['chat_member', 'my_chat_member'] as const

/**
 * change kind derived from the `old_chat_member.status` -> `new_chat_member.status`
 * transition. covers user-visible state changes; bot-side restrictions / promotions
 * collapse into the same buckets the codegen'd helpers expose
 */
export type ChatMemberChange =
  | 'joined'
  | 'left'
  | 'promoted'
  | 'demoted'
  | 'banned'
  | 'unbanned'
  | 'restricted'
  | 'subscribed'

const OUTSIDE = new Set(['left', 'kicked'])
const ELEVATED = new Set(['creator', 'administrator'])

function changeMatches (change: ChatMemberChange, oldStatus: string, newStatus: string) {
  switch (change) {
    case 'joined':
      return OUTSIDE.has(oldStatus) && !OUTSIDE.has(newStatus)
    case 'left':
      return !OUTSIDE.has(oldStatus) && OUTSIDE.has(newStatus)
    case 'promoted':
      return !ELEVATED.has(oldStatus) && ELEVATED.has(newStatus)
    case 'demoted':
      return ELEVATED.has(oldStatus) && !ELEVATED.has(newStatus)
    case 'banned':
      return oldStatus !== 'kicked' && newStatus === 'kicked'
    case 'unbanned':
      return oldStatus === 'kicked' && newStatus !== 'kicked'
    case 'restricted':
      return newStatus === 'restricted'
    case 'subscribed':
      // bot-api doesn't surface a dedicated "subscription started" status; the
      // closest signal is a transition into the regular `member` status from any
      // non-member origin, which mirrors what didJoinChat would catch for a
      // public subscription-gated chat
      return oldStatus !== 'member' && newStatus === 'member'
  }
}

function chatMemberChangeFilter (change: ChatMemberChange) {
  return defineFilter(
    `chatMember.${change}`,
    (u: unknown): u is ChatMemberBearingUpdate => {
      const raw = (u as {
        raw?: {
          old_chat_member?: { status?: string },
          new_chat_member?: { status?: string }
        }
      }).raw

      const oldStatus = raw?.old_chat_member?.status
      const newStatus = raw?.new_chat_member?.status

      if (typeof oldStatus !== 'string' || typeof newStatus !== 'string') {
        return false
      }

      return changeMatches(change, oldStatus, newStatus)
    },
    { kinds: CHAT_MEMBER_KINDS }
  )
}

/**
 * match a chat-member status transition. callable form `chatMember('joined')`
 * plus shorthand properties `chatMember.joined` / `.left` / `.promoted` /
 * `.demoted` / `.banned` / `.unbanned` / `.restricted` / `.subscribed`. the
 * derivation mirrors the codegen'd transition methods on `ChatMemberUpdate` /
 * `MyChatMemberUpdate`
 */
export const chatMember = Object.assign(
  (change: ChatMemberChange) => chatMemberChangeFilter(change),
  {
    joined: chatMemberChangeFilter('joined'),
    left: chatMemberChangeFilter('left'),
    promoted: chatMemberChangeFilter('promoted'),
    demoted: chatMemberChangeFilter('demoted'),
    banned: chatMemberChangeFilter('banned'),
    unbanned: chatMemberChangeFilter('unbanned'),
    restricted: chatMemberChangeFilter('restricted'),
    subscribed: chatMemberChangeFilter('subscribed')
  }
)

/**
 * match chat-member updates that concern the bot itself. accepts the bot's
 * user id as an argument so the filter stays a pure module-level value with
 * no `Telegram` binding; callers pass `tg.bot.id` after `tg.start()`. matches
 * when either `from.id` or `new_chat_member.user.id` equals the supplied id
 */
export function chatMemberSelf (botId: number): Filter<ChatMemberBearingUpdate> {
  return defineFilter(
    `chatMemberSelf(${botId})`,
    (u: unknown): u is ChatMemberBearingUpdate => {
      const raw = (u as {
        raw?: {
          from?: { id?: number },
          new_chat_member?: { user?: { id?: number } }
        }
      }).raw

      return raw?.new_chat_member?.user?.id === botId || raw?.from?.id === botId
    },
    { kinds: CHAT_MEMBER_KINDS }
  )
}
