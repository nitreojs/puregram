import { defineFilter } from '@puregram/api'
import type {
  ChannelChat,
  Chat,
  Filter,
  GroupChat,
  PrivateChat,
  SupergroupChat
} from '@puregram/api'

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

// `is_topic_message` lives only on Message-payload kinds — same domain as `sender_chat`
const TOPIC_MESSAGE_KINDS = SENDER_CHAT_KINDS

type ChatTypeKey = 'private' | 'group' | 'supergroup' | 'channel'
type SenderChatTypeKey = Exclude<ChatTypeKey, 'private'>

type ChatSubtype<T extends ChatTypeKey> =
  T extends 'private' ? PrivateChat
    : T extends 'group' ? GroupChat
      : T extends 'supergroup' ? SupergroupChat
        : T extends 'channel' ? ChannelChat
          : never

function chatTypeFilter<T extends ChatTypeKey> (type: T) {
  return defineFilter<unknown, { chat: ChatSubtype<T> }>(
    `chat.${type}`,
    u => (u as { raw?: { chat?: { type?: string } } }).raw?.chat?.type === type,
    { kinds: CHAT_KINDS }
  )
}

/**
 * match against `chat.type`. callable form `chat('private')` plus shorthand
 * properties `chat.private` / `chat.group` / `chat.supergroup` / `chat.channel`
 */
export const chat = Object.assign(
  <T extends ChatTypeKey> (type: T) => chatTypeFilter(type),
  {
    private: chatTypeFilter('private'),
    group: chatTypeFilter('group'),
    supergroup: chatTypeFilter('supergroup'),
    channel: chatTypeFilter('channel')
  }
)

function senderChatTypeFilter<T extends SenderChatTypeKey> (type: T) {
  return defineFilter<unknown, { senderChat: ChatSubtype<T> }>(
    `senderChat.${type}`,
    u => (u as { raw?: { sender_chat?: { type?: string } } }).raw?.sender_chat?.type === type,
    { kinds: SENDER_CHAT_KINDS }
  )
}

/**
 * match against `sender_chat.type` — bot-api restricts sender chats to group,
 * supergroup, and channel. callable `senderChat('channel')` plus shorthand
 * properties `senderChat.group` / `.supergroup` / `.channel`
 */
export const senderChat = Object.assign(
  <T extends SenderChatTypeKey> (type: T) => senderChatTypeFilter(type),
  {
    group: senderChatTypeFilter('group'),
    supergroup: senderChatTypeFilter('supergroup'),
    channel: senderChatTypeFilter('channel')
  }
)

// chatId only narrows presence — runtime literal ids don't project to types, so no Mod
/**
 * match when `chat.id` is one of the supplied ids. varargs or readonly array.
 * `kinds` metadata covers every chat-bearing kind for the dispatcher fast-path
 */
export function chatId (ids: readonly number[]): Filter<unknown>
export function chatId (...ids: number[]): Filter<unknown>
export function chatId (...args: [readonly number[]] | number[]) {
  const list = (args.length === 1 && Array.isArray(args[0]) ? args[0] : args) as readonly number[]
  const set = new Set<number>(list)

  return defineFilter(
    `chatId(${list.join(', ')})`,
    (u) => {
      const id = (u as { raw?: { chat?: { id?: number } } }).raw?.chat?.id

      return id !== undefined && set.has(id)
    },
    { kinds: CHAT_KINDS }
  )
}

/** match when the chat is a forum supergroup (`chat.is_forum === true`) */
export const forum = defineFilter<unknown, { chat: Omit<Chat, 'isForum'> & { isForum: true } }>(
  'forum',
  u => (u as { raw?: { chat?: { is_forum?: boolean } } }).raw?.chat?.is_forum === true,
  { kinds: CHAT_KINDS }
)

/** match when the message belongs to a forum topic (`is_topic_message === true`) */
export const topicMessage = defineFilter<unknown, { isTopicMessage: true }>(
  'topicMessage',
  u => (u as { raw?: { is_topic_message?: boolean } }).raw?.is_topic_message === true,
  { kinds: TOPIC_MESSAGE_KINDS }
)
