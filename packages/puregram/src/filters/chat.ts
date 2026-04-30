// chat-shape filters — match against the `chat` payload that bot-api attaches to
// every message-bearing kind plus the dedicated chat-member / chat-boost / reaction
// kinds. `chat(type)` and its `.private` / `.group` / `.supergroup` / `.channel`
// shorthands narrow on `chat.type`; `chatId(...)` narrows on `chat.id`; `forum`
// and `topicMessage` are boolean flags exposed by recent bot-api versions

import { defineFilter } from '@puregram/api'
import type { BoostAddedUpdate, BusinessMessageUpdate, ChannelPostUpdate, ChatBoostUpdate, ChatJoinRequestUpdate, ChatMemberUpdate, ChatSharedUpdate, DeleteChatPhotoUpdate, DeletedBusinessMessagesUpdate, EditedBusinessMessageUpdate, EditedChannelPostUpdate, EditedMessageUpdate, Filter, ForumTopicClosedUpdate, ForumTopicCreatedUpdate, ForumTopicEditedUpdate, ForumTopicReopenedUpdate, GeneralForumTopicHiddenUpdate, GeneralForumTopicUnhiddenUpdate, GiveawayCompletedUpdate, GiveawayCreatedUpdate, GiveawayWinnersUpdate, GroupChatCreatedUpdate, InvoiceUpdate, LeftChatMemberUpdate, MessageAutoDeleteTimerChangedUpdate, MessageReactionCountUpdate, MessageReactionUpdate, MessageUpdate, MigrateFromChatIdUpdate, MigrateToChatIdUpdate, MyChatMemberUpdate, NewChatMembersUpdate, NewChatPhotoUpdate, NewChatTitleUpdate, PassportDataUpdate, PinnedMessageUpdate, ProximityAlertTriggeredUpdate, RemovedChatBoostUpdate, SuccessfulPaymentUpdate, UsersSharedUpdate, VideoChatEndedUpdate, VideoChatParticipantsInvitedUpdate, VideoChatScheduledUpdate, VideoChatStartedUpdate, WebAppDataUpdate, WriteAccessAllowedUpdate } from '@puregram/api'

type ChatBearingUpdate =
  | MessageUpdate
  | EditedMessageUpdate
  | ChannelPostUpdate
  | EditedChannelPostUpdate
  | BusinessMessageUpdate
  | EditedBusinessMessageUpdate
  | DeletedBusinessMessagesUpdate
  | MessageReactionUpdate
  | MessageReactionCountUpdate
  | MyChatMemberUpdate
  | ChatMemberUpdate
  | ChatJoinRequestUpdate
  | ChatBoostUpdate
  | RemovedChatBoostUpdate
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

type SenderChatBearingUpdate =
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

const CHAT_KINDS = [
  'message', 'edited_message', 'channel_post', 'edited_channel_post',
  'business_message', 'edited_business_message', 'deleted_business_messages',
  'message_reaction', 'message_reaction_count',
  'my_chat_member', 'chat_member', 'chat_join_request',
  'chat_boost', 'removed_chat_boost',
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

const SENDER_CHAT_KINDS = [
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

// is_topic_message lives only on Message-payload kinds — same domain as the
// sender_chat field
const TOPIC_MESSAGE_KINDS = SENDER_CHAT_KINDS

type ChatType = 'private' | 'group' | 'supergroup' | 'channel'
type SenderChatType = 'group' | 'supergroup' | 'channel'

function chatTypeFilter<T extends ChatType> (type: T) {
  return defineFilter<ChatBearingUpdate, { raw: { chat: { type: T } } }>(
    `chat.${type}`,
    (u): u is ChatBearingUpdate =>
      (u as { raw?: { chat?: { type?: string } } }).raw?.chat?.type === type,
    { kinds: CHAT_KINDS }
  )
}

/**
 * match against `chat.type`. callable form `chat('private')` plus shorthand
 * properties `chat.private` / `chat.group` / `chat.supergroup` / `chat.channel`
 */
export const chat = Object.assign(
  (type: ChatType) => chatTypeFilter(type),
  {
    private: chatTypeFilter('private'),
    group: chatTypeFilter('group'),
    supergroup: chatTypeFilter('supergroup'),
    channel: chatTypeFilter('channel')
  }
)

function senderChatTypeFilter<T extends SenderChatType> (type: T) {
  return defineFilter<SenderChatBearingUpdate, { raw: { sender_chat: { type: T } } }>(
    `senderChat.${type}`,
    (u): u is SenderChatBearingUpdate =>
      (u as { raw?: { sender_chat?: { type?: string } } }).raw?.sender_chat?.type === type,
    { kinds: SENDER_CHAT_KINDS }
  )
}

/**
 * match against `sender_chat.type` — bot-api restricts sender chats to group,
 * supergroup, and channel. callable `senderChat('channel')` plus shorthand
 * properties `senderChat.group` / `.supergroup` / `.channel`
 */
export const senderChat = Object.assign(
  (type: SenderChatType) => senderChatTypeFilter(type),
  {
    group: senderChatTypeFilter('group'),
    supergroup: senderChatTypeFilter('supergroup'),
    channel: senderChatTypeFilter('channel')
  }
)

/**
 * match when `chat.id` is one of the supplied ids. accepts varargs or a
 * readonly array; metadata covers every chat-bearing update kind so the
 * dispatcher fast-path skips unrelated updates
 */
export function chatId (ids: readonly number[]): Filter<ChatBearingUpdate>
export function chatId (...ids: number[]): Filter<ChatBearingUpdate>
export function chatId (...args: [readonly number[]] | number[]) {
  const list = (args.length === 1 && Array.isArray(args[0]) ? args[0] : args) as readonly number[]
  const set = new Set<number>(list)

  return defineFilter(
    `chatId(${list.join(', ')})`,
    (u: unknown): u is ChatBearingUpdate => {
      const id = (u as { raw?: { chat?: { id?: number } } }).raw?.chat?.id

      return id !== undefined && set.has(id)
    },
    { kinds: CHAT_KINDS }
  )
}

/**
 * match when the chat is a forum supergroup (`chat.is_forum === true`)
 */
export const forum = defineFilter<ChatBearingUpdate, { raw: { chat: { is_forum: true } } }>(
  'forum',
  (u): u is ChatBearingUpdate =>
    (u as { raw?: { chat?: { is_forum?: boolean } } }).raw?.chat?.is_forum === true,
  { kinds: CHAT_KINDS }
)

/**
 * match when the message belongs to a forum topic (`is_topic_message === true`)
 */
export const topicMessage = defineFilter<SenderChatBearingUpdate, { raw: { is_topic_message: true } }>(
  'topicMessage',
  (u): u is SenderChatBearingUpdate =>
    (u as { raw?: { is_topic_message?: boolean } }).raw?.is_topic_message === true,
  { kinds: TOPIC_MESSAGE_KINDS }
)
