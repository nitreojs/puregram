export interface ShortcutAnchor {
  schemaArg: string
  accessPath: string[]
}

// hand-curated helpers attached to update classes alongside the schema-driven getters.
// `kind: 'getter'` emits a `get <name>(): <returnType> { return <expression> }`.
// `kind: 'method'` emits a `<name>(): <returnType> { <body> }`.
// extend MESSAGE_EXTRAS / CALLBACK_QUERY_EXTRAS / etc. to add more — emitter handles the rest
export type UpdateExtra =
  | { kind: 'getter', name: string, expression: string, returnType: string, jsdoc?: string }
  | { kind: 'method', name: string, params?: string, body: string, returnType: string, jsdoc?: string }

export interface UpdateKindSpec {
  kindName: string
  className: string
  payloadType: string
  source: { kind: 'update-field', field: string } | { kind: 'derived', messageField: string }
  anchors: ShortcutAnchor[]
  extras?: UpdateExtra[]
}

const MESSAGE_ANCHORS: ShortcutAnchor[] = [
  { schemaArg: 'chat_id', accessPath: ['raw', 'chat', 'id'] },
  { schemaArg: 'message_id', accessPath: ['raw', 'message_id'] }
]

const MESSAGE_EXTRAS: UpdateExtra[] = [
  { kind: 'getter', name: 'chatId', expression: 'this.raw.chat.id', returnType: 'number', jsdoc: 'Shortcut for `chat.id`.' },
  { kind: 'getter', name: 'senderId', expression: 'this.raw.from?.id ?? this.raw.sender_chat?.id ?? this.raw.chat.id', returnType: 'number', jsdoc: 'Best-effort sender id: `from.id` → `sender_chat.id` → `chat.id`.' },
  { kind: 'getter', name: 'replyToMessageId', expression: 'this.raw.reply_to_message?.message_id', returnType: 'number | undefined', jsdoc: 'Shortcut for `reply_to_message?.message_id`.' },

  // narrowing predicates — calling these in an `if` narrows the corresponding wrapper
  // getter from `T | undefined` to `T`
  { kind: 'method', name: 'hasText', body: 'return this.raw.text != null', returnType: "this is Has<this, 'text'>", jsdoc: 'True if this message has `text`.' },
  { kind: 'method', name: 'hasCaption', body: 'return this.raw.caption != null', returnType: "this is Has<this, 'caption'>", jsdoc: 'True if this message has `caption`.' },
  { kind: 'method', name: 'hasDice', body: 'return this.raw.dice != null', returnType: "this is Has<this, 'dice'>", jsdoc: 'True if this message has `dice`.' },
  { kind: 'method', name: 'hasAuthorSignature', body: 'return this.raw.author_signature != null', returnType: "this is Has<this, 'authorSignature'>", jsdoc: 'True if this message has `author_signature`.' },
  { kind: 'method', name: 'hasEntities', body: 'return this.raw.entities != null && this.raw.entities.length > 0', returnType: "this is Has<this, 'entities'>", jsdoc: 'True if this message has at least one `entities` item.' },
  { kind: 'method', name: 'hasCaptionEntities', body: 'return this.raw.caption_entities != null && this.raw.caption_entities.length > 0', returnType: "this is Has<this, 'captionEntities'>", jsdoc: 'True if this message has at least one `caption_entities` item.' },
  { kind: 'method', name: 'hasEntitiesOf', params: 'type: string', body: 'return this.raw.entities?.some(e => e.type === type) ?? false', returnType: 'boolean', jsdoc: 'True if any `entities` item has the given `type`.' },
  { kind: 'method', name: 'hasCaptionEntitiesOf', params: 'type: string', body: 'return this.raw.caption_entities?.some(e => e.type === type) ?? false', returnType: 'boolean', jsdoc: 'True if any `caption_entities` item has the given `type`.' },
  { kind: 'method', name: 'hasForwardOrigin', body: 'return this.raw.forward_origin != null', returnType: "this is Has<this, 'forwardOrigin'>", jsdoc: 'True if this message has `forward_origin`.' },
  { kind: 'method', name: 'isForwarded', body: 'return this.raw.forward_origin != null', returnType: "this is Has<this, 'forwardOrigin'>", jsdoc: 'Alias for `hasForwardOrigin()`.' },
  { kind: 'method', name: 'hasQuote', body: 'return this.raw.quote != null', returnType: "this is Has<this, 'quote'>", jsdoc: 'True if this reply quotes part of the original message.' },
  { kind: 'method', name: 'hasExternalReply', body: 'return this.raw.external_reply != null', returnType: "this is Has<this, 'externalReply'>", jsdoc: 'True if this message has `external_reply`.' },
  { kind: 'method', name: 'hasReplyToMessage', body: 'return this.raw.reply_to_message != null', returnType: "this is Has<this, 'replyToMessage' | 'replyToMessageId'>", jsdoc: 'True if this message has `reply_to_message`.' },
  { kind: 'method', name: 'hasViaBot', body: 'return this.raw.via_bot != null', returnType: "this is Has<this, 'viaBot'>", jsdoc: 'True if this message was sent via an inline bot.' },
  { kind: 'method', name: 'hasReplyToStory', body: 'return this.raw.reply_to_story != null', returnType: "this is Has<this, 'replyToStory'>", jsdoc: 'True if this message replies to a story.' },
  { kind: 'method', name: 'hasLinkPreviewOptions', body: 'return this.raw.link_preview_options != null', returnType: "this is Has<this, 'linkPreviewOptions'>", jsdoc: 'True if this message has `link_preview_options`.' },

  { kind: 'method', name: 'isReply', body: 'return this.raw.reply_to_message != null', returnType: "this is Has<this, 'replyToMessage' | 'replyToMessageId'>", jsdoc: 'True if this message is a reply.' },
  { kind: 'method', name: 'isMediaGroup', body: 'return this.raw.media_group_id != null', returnType: 'boolean', jsdoc: 'True if this message is part of a media group (album). Use `await update.collectMediaGroup()` from `@puregram/flow` to fetch the full album.' },
  { kind: 'method', name: 'isPrivate', body: "return this.raw.chat.type === 'private'", returnType: 'boolean', jsdoc: 'True if `chat.type === "private"`.' },
  { kind: 'method', name: 'isGroup', body: "return this.raw.chat.type === 'group'", returnType: 'boolean', jsdoc: 'True if `chat.type === "group"` (strict — supergroups excluded).' },
  { kind: 'method', name: 'isSupergroup', body: "return this.raw.chat.type === 'supergroup'", returnType: 'boolean', jsdoc: 'True if `chat.type === "supergroup"`.' },
  { kind: 'method', name: 'isChannel', body: "return this.raw.chat.type === 'channel'", returnType: 'boolean', jsdoc: 'True if `chat.type === "channel"`.' }
]

const CALLBACK_QUERY_EXTRAS: UpdateExtra[] = [
  { kind: 'getter', name: 'chatId', expression: 'this.raw.message?.chat.id', returnType: 'number | undefined', jsdoc: 'Shortcut for `message?.chat.id`.' },
  { kind: 'getter', name: 'messageId', expression: 'this.raw.message?.message_id', returnType: 'number | undefined', jsdoc: 'Shortcut for `message?.message_id`.' },
  { kind: 'getter', name: 'userId', expression: 'this.raw.from.id', returnType: 'number', jsdoc: 'Shortcut for `from.id`.' },

  { kind: 'method', name: 'hasMessage', body: 'return this.raw.message != null', returnType: "this is Has<this, 'message'>", jsdoc: 'True if the callback query carries a `message`.' },
  { kind: 'method', name: 'hasInlineMessageId', body: 'return this.raw.inline_message_id != null', returnType: "this is Has<this, 'inlineMessageId'>", jsdoc: 'True if the callback query has `inline_message_id` (came from an inline-mode bot message).' },
  { kind: 'method', name: 'hasData', body: 'return this.raw.data != null', returnType: "this is Has<this, 'data'>", jsdoc: 'True if the callback query has `data`.' },
  { kind: 'method', name: 'hasGameShortName', body: 'return this.raw.game_short_name != null', returnType: "this is Has<this, 'gameShortName'>", jsdoc: 'True if the callback query has `game_short_name`.' }
]

const INLINE_QUERY_EXTRAS: UpdateExtra[] = [
  { kind: 'method', name: 'hasLocation', body: 'return this.raw.location != null', returnType: "this is Has<this, 'location'>", jsdoc: 'True if the inline query has `location`.' }
]

const CHOSEN_INLINE_RESULT_EXTRAS: UpdateExtra[] = [
  { kind: 'method', name: 'hasLocation', body: 'return this.raw.location != null', returnType: "this is Has<this, 'location'>", jsdoc: 'True if the chosen inline result has `location`.' },
  { kind: 'method', name: 'hasInlineMessageId', body: 'return this.raw.inline_message_id != null', returnType: "this is Has<this, 'inlineMessageId'>", jsdoc: 'True if the chosen inline result has `inline_message_id`.' }
]

const MESSAGE_REACTION_EXTRAS: UpdateExtra[] = [
  { kind: 'method', name: 'hasUser', body: 'return this.raw.user != null', returnType: "this is Has<this, 'user'>", jsdoc: 'True if the reaction was made by a `user`.' },
  { kind: 'method', name: 'hasActorChat', body: 'return this.raw.actor_chat != null', returnType: "this is Has<this, 'actorChat'>", jsdoc: 'True if the reaction was made by an anonymous channel admin (`actor_chat`).' }
]

const POLL_ANSWER_EXTRAS: UpdateExtra[] = [
  { kind: 'method', name: 'hasUser', body: 'return this.raw.user != null', returnType: "this is Has<this, 'user'>", jsdoc: 'True if the poll answer was cast by a `user`.' },
  { kind: 'method', name: 'hasVoterChat', body: 'return this.raw.voter_chat != null', returnType: "this is Has<this, 'voterChat'>", jsdoc: 'True if the poll answer was cast by an anonymous channel (`voter_chat`).' }
]

export const UPDATE_KINDS: UpdateKindSpec[] = [
  // primary update fields
  { kindName: 'message', className: 'MessageUpdate', payloadType: 'TelegramMessage', source: { kind: 'update-field', field: 'message' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'edited_message', className: 'EditedMessageUpdate', payloadType: 'TelegramMessage', source: { kind: 'update-field', field: 'edited_message' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'channel_post', className: 'ChannelPostUpdate', payloadType: 'TelegramMessage', source: { kind: 'update-field', field: 'channel_post' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'edited_channel_post', className: 'EditedChannelPostUpdate', payloadType: 'TelegramMessage', source: { kind: 'update-field', field: 'edited_channel_post' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'business_connection', className: 'BusinessConnectionUpdate', payloadType: 'TelegramBusinessConnection', source: { kind: 'update-field', field: 'business_connection' }, anchors: [] },
  { kindName: 'business_message', className: 'BusinessMessageUpdate', payloadType: 'TelegramMessage', source: { kind: 'update-field', field: 'business_message' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'edited_business_message', className: 'EditedBusinessMessageUpdate', payloadType: 'TelegramMessage', source: { kind: 'update-field', field: 'edited_business_message' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'deleted_business_messages', className: 'DeletedBusinessMessagesUpdate', payloadType: 'TelegramBusinessMessagesDeleted', source: { kind: 'update-field', field: 'deleted_business_messages' }, anchors: [] },
  { kindName: 'message_reaction', className: 'MessageReactionUpdate', payloadType: 'TelegramMessageReactionUpdated', source: { kind: 'update-field', field: 'message_reaction' }, anchors: [] },
  { kindName: 'message_reaction_count', className: 'MessageReactionCountUpdate', payloadType: 'TelegramMessageReactionCountUpdated', source: { kind: 'update-field', field: 'message_reaction_count' }, anchors: [] },
  { kindName: 'inline_query', className: 'InlineQueryUpdate', payloadType: 'TelegramInlineQuery', source: { kind: 'update-field', field: 'inline_query' }, anchors: [{ schemaArg: 'inline_query_id', accessPath: ['raw', 'id'] }] },
  { kindName: 'chosen_inline_result', className: 'ChosenInlineResultUpdate', payloadType: 'TelegramChosenInlineResult', source: { kind: 'update-field', field: 'chosen_inline_result' }, anchors: [] },
  { kindName: 'callback_query', className: 'CallbackQueryUpdate', payloadType: 'TelegramCallbackQuery', source: { kind: 'update-field', field: 'callback_query' }, anchors: [{ schemaArg: 'callback_query_id', accessPath: ['raw', 'id'] }] },
  { kindName: 'shipping_query', className: 'ShippingQueryUpdate', payloadType: 'TelegramShippingQuery', source: { kind: 'update-field', field: 'shipping_query' }, anchors: [{ schemaArg: 'shipping_query_id', accessPath: ['raw', 'id'] }] },
  { kindName: 'pre_checkout_query', className: 'PreCheckoutQueryUpdate', payloadType: 'TelegramPreCheckoutQuery', source: { kind: 'update-field', field: 'pre_checkout_query' }, anchors: [{ schemaArg: 'pre_checkout_query_id', accessPath: ['raw', 'id'] }] },
  { kindName: 'poll', className: 'PollUpdate', payloadType: 'TelegramPoll', source: { kind: 'update-field', field: 'poll' }, anchors: [] },
  { kindName: 'poll_answer', className: 'PollAnswerUpdate', payloadType: 'TelegramPollAnswer', source: { kind: 'update-field', field: 'poll_answer' }, anchors: [] },
  { kindName: 'my_chat_member', className: 'MyChatMemberUpdate', payloadType: 'TelegramChatMemberUpdated', source: { kind: 'update-field', field: 'my_chat_member' }, anchors: [{ schemaArg: 'chat_id', accessPath: ['raw', 'chat', 'id'] }] },
  { kindName: 'chat_member', className: 'ChatMemberUpdate', payloadType: 'TelegramChatMemberUpdated', source: { kind: 'update-field', field: 'chat_member' }, anchors: [{ schemaArg: 'chat_id', accessPath: ['raw', 'chat', 'id'] }] },
  { kindName: 'chat_join_request', className: 'ChatJoinRequestUpdate', payloadType: 'TelegramChatJoinRequest', source: { kind: 'update-field', field: 'chat_join_request' }, anchors: [{ schemaArg: 'chat_id', accessPath: ['raw', 'chat', 'id'] }] },
  { kindName: 'chat_boost', className: 'ChatBoostUpdate', payloadType: 'TelegramChatBoostUpdated', source: { kind: 'update-field', field: 'chat_boost' }, anchors: [] },
  { kindName: 'removed_chat_boost', className: 'RemovedChatBoostUpdate', payloadType: 'TelegramChatBoostRemoved', source: { kind: 'update-field', field: 'removed_chat_boost' }, anchors: [] },

  // service-event derivations (all from a TelegramMessage payload)
  { kindName: 'new_chat_members', className: 'NewChatMembersUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'new_chat_members' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'left_chat_member', className: 'LeftChatMemberUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'left_chat_member' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'new_chat_title', className: 'NewChatTitleUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'new_chat_title' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'new_chat_photo', className: 'NewChatPhotoUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'new_chat_photo' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'delete_chat_photo', className: 'DeleteChatPhotoUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'delete_chat_photo' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'group_chat_created', className: 'GroupChatCreatedUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'group_chat_created' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'pinned_message', className: 'PinnedMessageUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'pinned_message' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'invoice', className: 'InvoiceUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'invoice' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'successful_payment', className: 'SuccessfulPaymentUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'successful_payment' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'users_shared', className: 'UsersSharedUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'users_shared' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'chat_shared', className: 'ChatSharedUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'chat_shared' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'web_app_data', className: 'WebAppDataUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'web_app_data' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'video_chat_scheduled', className: 'VideoChatScheduledUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'video_chat_scheduled' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'video_chat_started', className: 'VideoChatStartedUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'video_chat_started' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'video_chat_ended', className: 'VideoChatEndedUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'video_chat_ended' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'video_chat_participants_invited', className: 'VideoChatParticipantsInvitedUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'video_chat_participants_invited' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'forum_topic_created', className: 'ForumTopicCreatedUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'forum_topic_created' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'forum_topic_edited', className: 'ForumTopicEditedUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'forum_topic_edited' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'forum_topic_closed', className: 'ForumTopicClosedUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'forum_topic_closed' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'forum_topic_reopened', className: 'ForumTopicReopenedUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'forum_topic_reopened' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'general_forum_topic_hidden', className: 'GeneralForumTopicHiddenUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'general_forum_topic_hidden' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'general_forum_topic_unhidden', className: 'GeneralForumTopicUnhiddenUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'general_forum_topic_unhidden' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'giveaway_created', className: 'GiveawayCreatedUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'giveaway_created' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'giveaway_completed', className: 'GiveawayCompletedUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'giveaway_completed' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'giveaway_winners', className: 'GiveawayWinnersUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'giveaway_winners' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'boost_added', className: 'BoostAddedUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'boost_added' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'message_auto_delete_timer_changed', className: 'MessageAutoDeleteTimerChangedUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'message_auto_delete_timer_changed' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'migrate_to_chat_id', className: 'MigrateToChatIdUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'migrate_to_chat_id' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'migrate_from_chat_id', className: 'MigrateFromChatIdUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'migrate_from_chat_id' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'passport_data', className: 'PassportDataUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'passport_data' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'proximity_alert_triggered', className: 'ProximityAlertTriggeredUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'proximity_alert_triggered' }, anchors: MESSAGE_ANCHORS },
  { kindName: 'write_access_allowed', className: 'WriteAccessAllowedUpdate', payloadType: 'TelegramMessage', source: { kind: 'derived', messageField: 'write_access_allowed' }, anchors: MESSAGE_ANCHORS }
]

// bind extras post-hoc rather than copy-pasting the same list onto every entry —
// keeps the table above readable and centralises the rule (every TelegramMessage
// payload gets MESSAGE_EXTRAS). per-kind overrides go inline if needed
const KIND_EXTRAS: Record<string, UpdateExtra[]> = {
  callback_query: CALLBACK_QUERY_EXTRAS,
  inline_query: INLINE_QUERY_EXTRAS,
  chosen_inline_result: CHOSEN_INLINE_RESULT_EXTRAS,
  message_reaction: MESSAGE_REACTION_EXTRAS,
  poll_answer: POLL_ANSWER_EXTRAS
}

for (const k of UPDATE_KINDS) {
  if (k.extras) {
    continue
  }

  if (k.payloadType === 'TelegramMessage') {
    k.extras = MESSAGE_EXTRAS
  } else if (KIND_EXTRAS[k.kindName]) {
    k.extras = KIND_EXTRAS[k.kindName]
  }
}
