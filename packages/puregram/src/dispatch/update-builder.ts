import * as api from '@puregram/api'

/* eslint-disable @typescript-eslint/no-explicit-any -- raw class refs differ per kind; widening is intentional */
const UPDATE_FIELD_TO_CLASS: Record<string, new (raw: any, tg: any) => any> = {
  message: api.MessageUpdate,
  edited_message: api.EditedMessageUpdate,
  channel_post: api.ChannelPostUpdate,
  edited_channel_post: api.EditedChannelPostUpdate,
  business_connection: api.BusinessConnectionUpdate,
  business_message: api.BusinessMessageUpdate,
  edited_business_message: api.EditedBusinessMessageUpdate,
  deleted_business_messages: api.DeletedBusinessMessagesUpdate,
  message_reaction: api.MessageReactionUpdate,
  message_reaction_count: api.MessageReactionCountUpdate,
  inline_query: api.InlineQueryUpdate,
  chosen_inline_result: api.ChosenInlineResultUpdate,
  callback_query: api.CallbackQueryUpdate,
  shipping_query: api.ShippingQueryUpdate,
  pre_checkout_query: api.PreCheckoutQueryUpdate,
  poll: api.PollUpdate,
  poll_answer: api.PollAnswerUpdate,
  my_chat_member: api.MyChatMemberUpdate,
  chat_member: api.ChatMemberUpdate,
  chat_join_request: api.ChatJoinRequestUpdate,
  chat_boost: api.ChatBoostUpdate,
  removed_chat_boost: api.RemovedChatBoostUpdate
}

const SERVICE_FIELD_TO_CLASS: Record<string, new (raw: any, tg: any) => any> = {
  new_chat_members: api.NewChatMembersUpdate,
  left_chat_member: api.LeftChatMemberUpdate,
  new_chat_title: api.NewChatTitleUpdate,
  new_chat_photo: api.NewChatPhotoUpdate,
  delete_chat_photo: api.DeleteChatPhotoUpdate,
  group_chat_created: api.GroupChatCreatedUpdate,
  pinned_message: api.PinnedMessageUpdate,
  invoice: api.InvoiceUpdate,
  successful_payment: api.SuccessfulPaymentUpdate,
  users_shared: api.UsersSharedUpdate,
  chat_shared: api.ChatSharedUpdate,
  web_app_data: api.WebAppDataUpdate,
  video_chat_scheduled: api.VideoChatScheduledUpdate,
  video_chat_started: api.VideoChatStartedUpdate,
  video_chat_ended: api.VideoChatEndedUpdate,
  video_chat_participants_invited: api.VideoChatParticipantsInvitedUpdate,
  forum_topic_created: api.ForumTopicCreatedUpdate,
  forum_topic_edited: api.ForumTopicEditedUpdate,
  forum_topic_closed: api.ForumTopicClosedUpdate,
  forum_topic_reopened: api.ForumTopicReopenedUpdate,
  general_forum_topic_hidden: api.GeneralForumTopicHiddenUpdate,
  general_forum_topic_unhidden: api.GeneralForumTopicUnhiddenUpdate,
  giveaway_created: api.GiveawayCreatedUpdate,
  giveaway_completed: api.GiveawayCompletedUpdate,
  giveaway_winners: api.GiveawayWinnersUpdate,
  boost_added: api.BoostAddedUpdate,
  message_auto_delete_timer_changed: api.MessageAutoDeleteTimerChangedUpdate,
  migrate_to_chat_id: api.MigrateToChatIdUpdate,
  migrate_from_chat_id: api.MigrateFromChatIdUpdate,
  passport_data: api.PassportDataUpdate,
  proximity_alert_triggered: api.ProximityAlertTriggeredUpdate,
  write_access_allowed: api.WriteAccessAllowedUpdate
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export class UnsupportedUpdate {
  readonly kind = 'unknown' as const
  constructor (
    public readonly raw: unknown,
    public readonly rawKey: string,
    _tg: unknown
  ) {}
}

export function buildUpdate (rawUpdate: Record<string, unknown>, tg: unknown) {
  let primaryKey: string | undefined

  for (const k of Object.keys(rawUpdate)) {
    if (k !== 'update_id') {
      primaryKey = k; break
    }
  }

  if (primaryKey === undefined) {
    return new UnsupportedUpdate(rawUpdate, 'none', tg) as never
  }

  const cls = UPDATE_FIELD_TO_CLASS[primaryKey]

  if (!cls) {
    return new UnsupportedUpdate(rawUpdate[primaryKey], primaryKey, tg) as never
  }

  const payload = rawUpdate[primaryKey] as Record<string, unknown>

  if (primaryKey === 'message' || primaryKey === 'edited_message' || primaryKey === 'channel_post' || primaryKey === 'edited_channel_post') {
    for (const field of api.SERVICE_EVENT_ORDER) {
      if (field in payload && payload[field] !== undefined) {
        const serviceCls = SERVICE_FIELD_TO_CLASS[field]

        if (serviceCls) {
          // eslint-disable-next-line new-cap, @typescript-eslint/no-unsafe-return -- runtime class lookup
          return new serviceCls(payload, tg)
        }
      }
    }
  }

  // eslint-disable-next-line new-cap, @typescript-eslint/no-unsafe-return -- runtime class lookup
  return new cls(payload, tg)
}
