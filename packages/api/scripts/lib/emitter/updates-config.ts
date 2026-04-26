export interface ShortcutAnchor {
  schemaArg: string
  accessPath: string[]
}

export interface UpdateKindSpec {
  kindName: string
  className: string
  payloadType: string
  source: { kind: 'update-field', field: string } | { kind: 'derived', messageField: string }
  anchors: ShortcutAnchor[]
}

const MESSAGE_ANCHORS: ShortcutAnchor[] = [
  { schemaArg: 'chat_id',    accessPath: ['raw', 'chat', 'id'] },
  { schemaArg: 'message_id', accessPath: ['raw', 'message_id'] }
]

export const UPDATE_KINDS: UpdateKindSpec[] = [
  // primary update fields
  { kindName: 'message',                  className: 'MessageUpdate',                  payloadType: 'TelegramMessage',                       source: { kind: 'update-field', field: 'message' },                  anchors: MESSAGE_ANCHORS },
  { kindName: 'edited_message',           className: 'EditedMessageUpdate',            payloadType: 'TelegramMessage',                       source: { kind: 'update-field', field: 'edited_message' },           anchors: MESSAGE_ANCHORS },
  { kindName: 'channel_post',             className: 'ChannelPostUpdate',              payloadType: 'TelegramMessage',                       source: { kind: 'update-field', field: 'channel_post' },             anchors: MESSAGE_ANCHORS },
  { kindName: 'edited_channel_post',      className: 'EditedChannelPostUpdate',        payloadType: 'TelegramMessage',                       source: { kind: 'update-field', field: 'edited_channel_post' },      anchors: MESSAGE_ANCHORS },
  { kindName: 'business_connection',      className: 'BusinessConnectionUpdate',       payloadType: 'TelegramBusinessConnection',            source: { kind: 'update-field', field: 'business_connection' },      anchors: [] },
  { kindName: 'business_message',         className: 'BusinessMessageUpdate',          payloadType: 'TelegramMessage',                       source: { kind: 'update-field', field: 'business_message' },         anchors: MESSAGE_ANCHORS },
  { kindName: 'edited_business_message',  className: 'EditedBusinessMessageUpdate',    payloadType: 'TelegramMessage',                       source: { kind: 'update-field', field: 'edited_business_message' },  anchors: MESSAGE_ANCHORS },
  { kindName: 'deleted_business_messages', className: 'DeletedBusinessMessagesUpdate', payloadType: 'TelegramBusinessMessagesDeleted',       source: { kind: 'update-field', field: 'deleted_business_messages' }, anchors: [] },
  { kindName: 'message_reaction',         className: 'MessageReactionUpdate',          payloadType: 'TelegramMessageReactionUpdated',        source: { kind: 'update-field', field: 'message_reaction' },         anchors: [] },
  { kindName: 'message_reaction_count',   className: 'MessageReactionCountUpdate',     payloadType: 'TelegramMessageReactionCountUpdated',   source: { kind: 'update-field', field: 'message_reaction_count' },   anchors: [] },
  { kindName: 'inline_query',             className: 'InlineQueryUpdate',              payloadType: 'TelegramInlineQuery',                   source: { kind: 'update-field', field: 'inline_query' },             anchors: [{ schemaArg: 'inline_query_id', accessPath: ['raw', 'id'] }] },
  { kindName: 'chosen_inline_result',     className: 'ChosenInlineResultUpdate',       payloadType: 'TelegramChosenInlineResult',            source: { kind: 'update-field', field: 'chosen_inline_result' },     anchors: [] },
  { kindName: 'callback_query',           className: 'CallbackQueryUpdate',            payloadType: 'TelegramCallbackQuery',                 source: { kind: 'update-field', field: 'callback_query' },           anchors: [{ schemaArg: 'callback_query_id', accessPath: ['raw', 'id'] }] },
  { kindName: 'shipping_query',           className: 'ShippingQueryUpdate',            payloadType: 'TelegramShippingQuery',                 source: { kind: 'update-field', field: 'shipping_query' },           anchors: [{ schemaArg: 'shipping_query_id', accessPath: ['raw', 'id'] }] },
  { kindName: 'pre_checkout_query',       className: 'PreCheckoutQueryUpdate',         payloadType: 'TelegramPreCheckoutQuery',              source: { kind: 'update-field', field: 'pre_checkout_query' },       anchors: [{ schemaArg: 'pre_checkout_query_id', accessPath: ['raw', 'id'] }] },
  { kindName: 'poll',                     className: 'PollUpdate',                     payloadType: 'TelegramPoll',                          source: { kind: 'update-field', field: 'poll' },                     anchors: [] },
  { kindName: 'poll_answer',              className: 'PollAnswerUpdate',               payloadType: 'TelegramPollAnswer',                    source: { kind: 'update-field', field: 'poll_answer' },              anchors: [] },
  { kindName: 'my_chat_member',           className: 'MyChatMemberUpdate',             payloadType: 'TelegramChatMemberUpdated',             source: { kind: 'update-field', field: 'my_chat_member' },           anchors: [{ schemaArg: 'chat_id', accessPath: ['raw', 'chat', 'id'] }] },
  { kindName: 'chat_member',              className: 'ChatMemberUpdate',               payloadType: 'TelegramChatMemberUpdated',             source: { kind: 'update-field', field: 'chat_member' },              anchors: [{ schemaArg: 'chat_id', accessPath: ['raw', 'chat', 'id'] }] },
  { kindName: 'chat_join_request',        className: 'ChatJoinRequestUpdate',          payloadType: 'TelegramChatJoinRequest',               source: { kind: 'update-field', field: 'chat_join_request' },        anchors: [{ schemaArg: 'chat_id', accessPath: ['raw', 'chat', 'id'] }] },
  { kindName: 'chat_boost',               className: 'ChatBoostUpdate',                payloadType: 'TelegramChatBoostUpdated',              source: { kind: 'update-field', field: 'chat_boost' },               anchors: [] },
  { kindName: 'removed_chat_boost',       className: 'RemovedChatBoostUpdate',         payloadType: 'TelegramChatBoostRemoved',              source: { kind: 'update-field', field: 'removed_chat_boost' },       anchors: [] },

  // service-event derivations (all from a TelegramMessage payload)
  { kindName: 'new_chat_members',                  className: 'NewChatMembersUpdate',                  payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'new_chat_members' },                  anchors: MESSAGE_ANCHORS },
  { kindName: 'left_chat_member',                  className: 'LeftChatMemberUpdate',                  payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'left_chat_member' },                  anchors: MESSAGE_ANCHORS },
  { kindName: 'new_chat_title',                    className: 'NewChatTitleUpdate',                    payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'new_chat_title' },                    anchors: MESSAGE_ANCHORS },
  { kindName: 'new_chat_photo',                    className: 'NewChatPhotoUpdate',                    payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'new_chat_photo' },                    anchors: MESSAGE_ANCHORS },
  { kindName: 'delete_chat_photo',                 className: 'DeleteChatPhotoUpdate',                 payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'delete_chat_photo' },                 anchors: MESSAGE_ANCHORS },
  { kindName: 'group_chat_created',                className: 'GroupChatCreatedUpdate',                payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'group_chat_created' },                anchors: MESSAGE_ANCHORS },
  { kindName: 'pinned_message',                    className: 'PinnedMessageUpdate',                   payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'pinned_message' },                    anchors: MESSAGE_ANCHORS },
  { kindName: 'invoice',                           className: 'InvoiceUpdate',                         payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'invoice' },                           anchors: MESSAGE_ANCHORS },
  { kindName: 'successful_payment',                className: 'SuccessfulPaymentUpdate',               payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'successful_payment' },                anchors: MESSAGE_ANCHORS },
  { kindName: 'users_shared',                      className: 'UsersSharedUpdate',                     payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'users_shared' },                      anchors: MESSAGE_ANCHORS },
  { kindName: 'chat_shared',                       className: 'ChatSharedUpdate',                      payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'chat_shared' },                       anchors: MESSAGE_ANCHORS },
  { kindName: 'web_app_data',                      className: 'WebAppDataUpdate',                      payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'web_app_data' },                      anchors: MESSAGE_ANCHORS },
  { kindName: 'video_chat_scheduled',              className: 'VideoChatScheduledUpdate',              payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'video_chat_scheduled' },              anchors: MESSAGE_ANCHORS },
  { kindName: 'video_chat_started',                className: 'VideoChatStartedUpdate',                payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'video_chat_started' },                anchors: MESSAGE_ANCHORS },
  { kindName: 'video_chat_ended',                  className: 'VideoChatEndedUpdate',                  payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'video_chat_ended' },                  anchors: MESSAGE_ANCHORS },
  { kindName: 'video_chat_participants_invited',   className: 'VideoChatParticipantsInvitedUpdate',    payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'video_chat_participants_invited' },   anchors: MESSAGE_ANCHORS },
  { kindName: 'forum_topic_created',               className: 'ForumTopicCreatedUpdate',               payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'forum_topic_created' },               anchors: MESSAGE_ANCHORS },
  { kindName: 'forum_topic_edited',                className: 'ForumTopicEditedUpdate',                payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'forum_topic_edited' },                anchors: MESSAGE_ANCHORS },
  { kindName: 'forum_topic_closed',                className: 'ForumTopicClosedUpdate',                payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'forum_topic_closed' },                anchors: MESSAGE_ANCHORS },
  { kindName: 'forum_topic_reopened',              className: 'ForumTopicReopenedUpdate',              payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'forum_topic_reopened' },              anchors: MESSAGE_ANCHORS },
  { kindName: 'general_forum_topic_hidden',        className: 'GeneralForumTopicHiddenUpdate',         payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'general_forum_topic_hidden' },        anchors: MESSAGE_ANCHORS },
  { kindName: 'general_forum_topic_unhidden',      className: 'GeneralForumTopicUnhiddenUpdate',       payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'general_forum_topic_unhidden' },      anchors: MESSAGE_ANCHORS },
  { kindName: 'giveaway_created',                  className: 'GiveawayCreatedUpdate',                 payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'giveaway_created' },                  anchors: MESSAGE_ANCHORS },
  { kindName: 'giveaway_completed',                className: 'GiveawayCompletedUpdate',               payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'giveaway_completed' },                anchors: MESSAGE_ANCHORS },
  { kindName: 'giveaway_winners',                  className: 'GiveawayWinnersUpdate',                 payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'giveaway_winners' },                  anchors: MESSAGE_ANCHORS },
  { kindName: 'boost_added',                       className: 'BoostAddedUpdate',                      payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'boost_added' },                       anchors: MESSAGE_ANCHORS },
  { kindName: 'message_auto_delete_timer_changed', className: 'MessageAutoDeleteTimerChangedUpdate',   payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'message_auto_delete_timer_changed' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'migrate_to_chat_id',                className: 'MigrateToChatIdUpdate',                 payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'migrate_to_chat_id' },                anchors: MESSAGE_ANCHORS },
  { kindName: 'migrate_from_chat_id',              className: 'MigrateFromChatIdUpdate',               payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'migrate_from_chat_id' },              anchors: MESSAGE_ANCHORS },
  { kindName: 'passport_data',                     className: 'PassportDataUpdate',                    payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'passport_data' },                     anchors: MESSAGE_ANCHORS },
  { kindName: 'proximity_alert_triggered',         className: 'ProximityAlertTriggeredUpdate',         payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'proximity_alert_triggered' },         anchors: MESSAGE_ANCHORS },
  { kindName: 'write_access_allowed',              className: 'WriteAccessAllowedUpdate',              payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'write_access_allowed' },              anchors: MESSAGE_ANCHORS }
]
