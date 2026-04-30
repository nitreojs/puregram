// forward-origin filter — match against `forward_origin.type` on any
// message-payload update. callable form `forwardOrigin('user')` plus shorthand
// properties `.user` / `.hiddenUser` / `.chat` / `.channel`. `hidden_user`
// maps to camelCase `hiddenUser` for the shorthand surface

import { defineFilter } from '@puregram/api'
import type {
  TelegramMessageOriginChannel,
  TelegramMessageOriginChat,
  TelegramMessageOriginHiddenUser,
  TelegramMessageOriginUser
} from '@puregram/api'

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

type ForwardOriginType = 'user' | 'hidden_user' | 'chat' | 'channel'

type ForwardOriginVariant<T extends ForwardOriginType> =
  T extends 'user' ? TelegramMessageOriginUser
    : T extends 'hidden_user' ? TelegramMessageOriginHiddenUser
      : T extends 'chat' ? TelegramMessageOriginChat
        : T extends 'channel' ? TelegramMessageOriginChannel
          : never

function forwardOriginTypeFilter<T extends ForwardOriginType> (type: T) {
  // wrapper getter `forwardOrigin` returns `TelegramMessageOrigin | undefined` —
  // a discriminated union of plain interfaces, so narrowing happens via the raw
  // `type` literal already; no Omit gymnastics needed
  return defineFilter<unknown, { forwardOrigin: ForwardOriginVariant<T> }>(
    `forwardOrigin.${type}`,
    u => (u as { raw?: { forward_origin?: { type?: string } } }).raw?.forward_origin?.type === type,
    { kinds: MESSAGE_PAYLOAD_KINDS }
  )
}

/**
 * match against `forward_origin.type`. callable form `forwardOrigin('channel')`
 * plus shorthand properties `forwardOrigin.user` / `.hiddenUser` / `.chat` /
 * `.channel` — `hidden_user` is exposed as the camelCase `hiddenUser` on the
 * shorthand object
 */
export const forwardOrigin = Object.assign(
  <T extends ForwardOriginType> (type: T) => forwardOriginTypeFilter(type),
  {
    user: forwardOriginTypeFilter('user'),
    hiddenUser: forwardOriginTypeFilter('hidden_user'),
    chat: forwardOriginTypeFilter('chat'),
    channel: forwardOriginTypeFilter('channel')
  }
)
