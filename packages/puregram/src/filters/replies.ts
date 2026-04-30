// reply-target filters — `hasReply` matches any message that is a reply, and
// `replyTo(id)` matches replies pointing at a specific source message. both
// narrow `raw.reply_to_message` to non-undefined so handler code can read it
// without an optional-chain. only message-payload kinds carry the field

import { defineFilter } from '@puregram/api'
import type { BusinessMessageUpdate, ChannelPostUpdate, EditedBusinessMessageUpdate, EditedChannelPostUpdate, EditedMessageUpdate, Filter, Message, MessageUpdate } from '@puregram/api'

type ReplyBearingUpdate =
  | MessageUpdate
  | EditedMessageUpdate
  | ChannelPostUpdate
  | EditedChannelPostUpdate
  | BusinessMessageUpdate
  | EditedBusinessMessageUpdate

const REPLY_KINDS = [
  'message', 'edited_message', 'channel_post', 'edited_channel_post',
  'business_message', 'edited_business_message'
] as const

/**
 * match when the message is a reply (`reply_to_message` set). composing with
 * a kind filter (e.g. `kind.message.and(hasReply)`) leaves `raw.reply_to_message`
 * narrowed to non-undefined for the handler
 */
export const hasReply = defineFilter<ReplyBearingUpdate, { replyToMessage: Message }>(
  'hasReply',
  (u): u is ReplyBearingUpdate =>
    (u as { raw?: { reply_to_message?: unknown } }).raw?.reply_to_message != null,
  { kinds: REPLY_KINDS }
)

/**
 * match when the message replies to the message with the given `message_id`.
 * useful for routing user responses back to a previously-sent prompt — pair
 * with the id returned by `tg.sendMessage(...)` to dispatch only on direct
 * replies to that specific message
 */
export function replyTo (
  messageId: number
): Filter<ReplyBearingUpdate, { replyToMessage: Message }> {
  return defineFilter<ReplyBearingUpdate, { replyToMessage: Message }>(
    `replyTo(${messageId})`,
    (u): u is ReplyBearingUpdate =>
      (u as { raw?: { reply_to_message?: { message_id?: number } } }).raw?.reply_to_message?.message_id === messageId,
    { kinds: REPLY_KINDS }
  )
}
