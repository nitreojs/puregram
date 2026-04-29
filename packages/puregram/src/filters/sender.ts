// sender-shape filters — match against `from` and the bot-api flags surfaced on
// it. `from(...)` narrows on `from.id`; `fromBot` / `fromPremium` are boolean
// flags; `viaBot` and `anonymous` express common authorship patterns

import { defineFilter } from '@puregram/api'
import type { BoostAddedUpdate, BusinessMessageUpdate, CallbackQueryUpdate, ChannelPostUpdate, ChatJoinRequestUpdate, ChatMemberUpdate, ChatSharedUpdate, ChosenInlineResultUpdate, DeleteChatPhotoUpdate, EditedBusinessMessageUpdate, EditedChannelPostUpdate, EditedMessageUpdate, Filter, ForumTopicClosedUpdate, ForumTopicCreatedUpdate, ForumTopicEditedUpdate, ForumTopicReopenedUpdate, GeneralForumTopicHiddenUpdate, GeneralForumTopicUnhiddenUpdate, GiveawayCompletedUpdate, GiveawayCreatedUpdate, GiveawayWinnersUpdate, GroupChatCreatedUpdate, InlineQueryUpdate, InvoiceUpdate, LeftChatMemberUpdate, MessageAutoDeleteTimerChangedUpdate, MessageUpdate, MigrateFromChatIdUpdate, MigrateToChatIdUpdate, MyChatMemberUpdate, NewChatMembersUpdate, NewChatPhotoUpdate, NewChatTitleUpdate, PassportDataUpdate, PinnedMessageUpdate, PreCheckoutQueryUpdate, ProximityAlertTriggeredUpdate, ShippingQueryUpdate, SuccessfulPaymentUpdate, UsersSharedUpdate, VideoChatEndedUpdate, VideoChatParticipantsInvitedUpdate, VideoChatScheduledUpdate, VideoChatStartedUpdate, WebAppDataUpdate, WriteAccessAllowedUpdate } from '@puregram/api'

type FromBearingUpdate =
  | MessageUpdate
  | EditedMessageUpdate
  | ChannelPostUpdate
  | EditedChannelPostUpdate
  | BusinessMessageUpdate
  | EditedBusinessMessageUpdate
  | InlineQueryUpdate
  | ChosenInlineResultUpdate
  | CallbackQueryUpdate
  | ShippingQueryUpdate
  | PreCheckoutQueryUpdate
  | MyChatMemberUpdate
  | ChatMemberUpdate
  | ChatJoinRequestUpdate
  | NewChatMembersUpdate
  | LeftChatMemberUpdate
  | NewChatTitleUpdate
  | NewChatPhotoUpdate
  | DeleteChatPhotoUpdate
  | GroupChatCreatedUpdate
  | PinnedMessageUpdate
  | InvoiceUpdate
  | SuccessfulPaymentUpdate
  | UsersSharedUpdate
  | ChatSharedUpdate
  | WebAppDataUpdate
  | VideoChatScheduledUpdate
  | VideoChatStartedUpdate
  | VideoChatEndedUpdate
  | VideoChatParticipantsInvitedUpdate
  | ForumTopicCreatedUpdate
  | ForumTopicEditedUpdate
  | ForumTopicClosedUpdate
  | ForumTopicReopenedUpdate
  | GeneralForumTopicHiddenUpdate
  | GeneralForumTopicUnhiddenUpdate
  | GiveawayCreatedUpdate
  | GiveawayCompletedUpdate
  | GiveawayWinnersUpdate
  | BoostAddedUpdate
  | MessageAutoDeleteTimerChangedUpdate
  | MigrateToChatIdUpdate
  | MigrateFromChatIdUpdate
  | PassportDataUpdate
  | ProximityAlertTriggeredUpdate
  | WriteAccessAllowedUpdate

// `via_bot` and the `from`/`chat`-id equality check live on Message-payload kinds
// (bot-api never sets `via_bot` on inline / callback / chat-member updates)
type MessagePayloadUpdate =
  | MessageUpdate
  | EditedMessageUpdate
  | ChannelPostUpdate
  | EditedChannelPostUpdate
  | BusinessMessageUpdate
  | EditedBusinessMessageUpdate
  | NewChatMembersUpdate
  | LeftChatMemberUpdate
  | NewChatTitleUpdate
  | NewChatPhotoUpdate
  | DeleteChatPhotoUpdate
  | GroupChatCreatedUpdate
  | PinnedMessageUpdate
  | InvoiceUpdate
  | SuccessfulPaymentUpdate
  | UsersSharedUpdate
  | ChatSharedUpdate
  | WebAppDataUpdate
  | VideoChatScheduledUpdate
  | VideoChatStartedUpdate
  | VideoChatEndedUpdate
  | VideoChatParticipantsInvitedUpdate
  | ForumTopicCreatedUpdate
  | ForumTopicEditedUpdate
  | ForumTopicClosedUpdate
  | ForumTopicReopenedUpdate
  | GeneralForumTopicHiddenUpdate
  | GeneralForumTopicUnhiddenUpdate
  | GiveawayCreatedUpdate
  | GiveawayCompletedUpdate
  | GiveawayWinnersUpdate
  | BoostAddedUpdate
  | MessageAutoDeleteTimerChangedUpdate
  | MigrateToChatIdUpdate
  | MigrateFromChatIdUpdate
  | PassportDataUpdate
  | ProximityAlertTriggeredUpdate
  | WriteAccessAllowedUpdate

const FROM_KINDS = [
  'message', 'edited_message', 'channel_post', 'edited_channel_post',
  'business_message', 'edited_business_message',
  'inline_query', 'chosen_inline_result', 'callback_query',
  'shipping_query', 'pre_checkout_query',
  'my_chat_member', 'chat_member', 'chat_join_request',
  'new_chat_members', 'left_chat_member', 'new_chat_title', 'new_chat_photo',
  'delete_chat_photo', 'group_chat_created', 'pinned_message', 'invoice',
  'successful_payment', 'users_shared', 'chat_shared', 'web_app_data',
  'video_chat_scheduled', 'video_chat_started', 'video_chat_ended',
  'video_chat_participants_invited', 'forum_topic_created', 'forum_topic_edited',
  'forum_topic_closed', 'forum_topic_reopened', 'general_forum_topic_hidden',
  'general_forum_topic_unhidden', 'giveaway_created', 'giveaway_completed',
  'giveaway_winners', 'boost_added', 'message_auto_delete_timer_changed',
  'migrate_to_chat_id', 'migrate_from_chat_id', 'passport_data',
  'proximity_alert_triggered', 'write_access_allowed'
] as const

const MESSAGE_PAYLOAD_KINDS = [
  'message', 'edited_message', 'channel_post', 'edited_channel_post',
  'business_message', 'edited_business_message',
  'new_chat_members', 'left_chat_member', 'new_chat_title', 'new_chat_photo',
  'delete_chat_photo', 'group_chat_created', 'pinned_message', 'invoice',
  'successful_payment', 'users_shared', 'chat_shared', 'web_app_data',
  'video_chat_scheduled', 'video_chat_started', 'video_chat_ended',
  'video_chat_participants_invited', 'forum_topic_created', 'forum_topic_edited',
  'forum_topic_closed', 'forum_topic_reopened', 'general_forum_topic_hidden',
  'general_forum_topic_unhidden', 'giveaway_created', 'giveaway_completed',
  'giveaway_winners', 'boost_added', 'message_auto_delete_timer_changed',
  'migrate_to_chat_id', 'migrate_from_chat_id', 'passport_data',
  'proximity_alert_triggered', 'write_access_allowed'
] as const

/**
 * match when `from.id` is one of the supplied ids. accepts varargs or a single
 * readonly array. covers every `from`-bearing update kind including queries
 * (inline, callback, shipping, pre-checkout) and chat-member events
 */
export function from (ids: readonly number[]): Filter<FromBearingUpdate>
export function from (...ids: number[]): Filter<FromBearingUpdate>
export function from (...args: [readonly number[]] | number[]) {
  const list = (args.length === 1 && Array.isArray(args[0]) ? args[0] : args) as readonly number[]
  const set = new Set<number>(list)

  return defineFilter(
    `from(${list.join(', ')})`,
    (u: unknown): u is FromBearingUpdate => {
      const id = (u as { raw?: { from?: { id?: number } } }).raw?.from?.id

      return id !== undefined && set.has(id)
    },
    { kinds: FROM_KINDS }
  )
}

/**
 * match when the sender is another bot (`from.is_bot === true`)
 */
export const fromBot = defineFilter(
  'fromBot',
  (u: unknown): u is FromBearingUpdate =>
    (u as { raw?: { from?: { is_bot?: boolean } } }).raw?.from?.is_bot === true,
  { kinds: FROM_KINDS }
)

/**
 * match when the sender is a Telegram Premium user (`from.is_premium === true`)
 */
export const fromPremium = defineFilter(
  'fromPremium',
  (u: unknown): u is FromBearingUpdate =>
    (u as { raw?: { from?: { is_premium?: boolean } } }).raw?.from?.is_premium === true,
  { kinds: FROM_KINDS }
)

/**
 * match when the message was sent through an inline bot (`via_bot` set on the
 * message payload)
 */
export const viaBot = defineFilter(
  'viaBot',
  (u: unknown): u is MessagePayloadUpdate =>
    (u as { raw?: { via_bot?: unknown } }).raw?.via_bot != null,
  { kinds: MESSAGE_PAYLOAD_KINDS }
)

/**
 * match when the message was sent as the chat itself (anonymous admin or
 * channel signature). detected when `from.id` equals `chat.id`
 */
export const anonymous = defineFilter(
  'anonymous',
  (u: unknown): u is MessagePayloadUpdate => {
    const raw = (u as { raw?: { from?: { id?: number }, chat?: { id?: number } } }).raw
    const fromId = raw?.from?.id
    const chatId = raw?.chat?.id

    return fromId !== undefined && chatId !== undefined && fromId === chatId
  },
  { kinds: MESSAGE_PAYLOAD_KINDS }
)
