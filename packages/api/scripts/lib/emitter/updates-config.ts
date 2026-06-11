import type { Schema, SchemaObject } from '../schema-types'

export interface ShortcutAnchor {
  schemaArg: string
  accessPath: string[]
  nonNull?: boolean
  optional?: boolean
}

export type UpdateExtra =
  | { kind: 'getter', name: string, expression: string, returnType: string, jsdoc?: string }
  | { kind: 'method', name: string, params?: string, body: string, returnType: string, jsdoc?: string, typeParams?: string }

export interface UpdateKindSpec {
  kindName: string
  className: string
  payloadType: string
  source: { kind: 'update-field', field: string } | { kind: 'derived', messageField: string }
  anchors: ShortcutAnchor[]
  extras?: UpdateExtra[]
}

// per-update verb renames — separate from telegram-level SHORTCUTS so a method can be
// a per-update shortcut (`answer` on CallbackQueryUpdate) without joining the telegram-level list
export const SHORTCUT_RENAMES: Record<string, string> = {
  sendMessage: 'send',
  forwardMessage: 'forward',
  forwardMessages: 'forwardMany',
  copyMessage: 'copy',
  copyMessages: 'copyMany',
  deleteMessage: 'delete',
  deleteMessages: 'deleteMany',
  editMessageText: 'edit',
  editMessageCaption: 'editCaption',
  editMessageMedia: 'editMedia',
  editMessageReplyMarkup: 'editReplyMarkup',
  editMessageLiveLocation: 'editLiveLocation',
  stopMessageLiveLocation: 'stopLiveLocation',
  pinChatMessage: 'pin',
  unpinChatMessage: 'unpin',
  answerCallbackQuery: 'answer',
  answerInlineQuery: 'answer',
  answerShippingQuery: 'answer',
  answerPreCheckoutQuery: 'answer',
  answerGuestQuery: 'answer',
  answerChatJoinRequestQuery: 'answer'
}

export function shortcutNameFor (method: string) {
  return SHORTCUT_RENAMES[method] ?? method
}

// extra short names emitted alongside the canonical shortcut, not in place of it — so both
// `update.sendRichMessage` and `update.sendRich` exist. reply twins alias too (replyWithRich)
export const SHORTCUT_ALIASES: Record<string, string> = {
  sendRichMessage: 'sendRich',
  sendMessageDraft: 'sendDraft',
  sendRichMessageDraft: 'sendRichDraft'
}

// send → reply, sendPhoto → replyWithPhoto, sendRich → replyWithRich
export function replyVerbForSendName (name: string) {
  return name === 'send' ? 'reply' : `replyWith${name.slice('send'.length)}`
}

const MESSAGE_ANCHORS: ShortcutAnchor[] = [
  { schemaArg: 'chat_id', accessPath: ['raw', 'chat', 'id'] },
  { schemaArg: 'message_id', accessPath: ['raw', 'message_id'] }
]

// not part of MESSAGE_ANCHORS on purpose — message_thread_id is opt-in via the `thread`
// namespace, never auto-injected on plain update.send(). nonNull because the namespace only
// exists when raw.message_thread_id is set
export const THREAD_ANCHOR: ShortcutAnchor = {
  schemaArg: 'message_thread_id',
  accessPath: ['raw', 'message_thread_id'],
  nonNull: true
}

export const BUSINESS_ANCHOR: ShortcutAnchor = {
  schemaArg: 'business_connection_id',
  accessPath: ['raw', 'business_connection_id'],
  optional: true
}

const PICK_DOWNLOAD = 'const t = this.raw.document ?? this.raw.video ?? this.raw.audio ?? this.raw.voice ?? this.raw.video_note ?? this.raw.animation ?? this.raw.live_photo ?? this.raw.photo ?? this.raw.sticker;'

const MESSAGE_EXTRAS: UpdateExtra[] = [
  { kind: 'getter', name: 'chatId', expression: 'this.raw.chat.id', returnType: 'number', jsdoc: 'shortcut for `chat.id`' },
  { kind: 'getter', name: 'senderId', expression: 'this.raw.from?.id ?? this.raw.sender_chat?.id ?? this.raw.chat.id', returnType: 'number', jsdoc: 'best-effort sender id: `from.id` → `sender_chat.id` → `chat.id`' },
  { kind: 'getter', name: 'replyToMessageId', expression: 'this.raw.reply_to_message?.message_id', returnType: 'number | undefined', jsdoc: 'shortcut for `reply_to_message?.message_id`' },

  { kind: 'method', name: 'hasReplyToMessage', body: 'return this.raw.reply_to_message != null', returnType: "this is Has<this, 'replyToMessage' | 'replyToMessageId'>", jsdoc: 'true if this message has `reply_to_message`' },

  { kind: 'method', name: 'hasEntitiesOf', params: 'type: string', body: 'return this.raw.entities?.some(e => e.type === type) ?? false', returnType: 'boolean', jsdoc: 'true if any `entities` item has the given `type`' },
  { kind: 'method', name: 'hasCaptionEntitiesOf', params: 'type: string', body: 'return this.raw.caption_entities?.some(e => e.type === type) ?? false', returnType: 'boolean', jsdoc: 'true if any `caption_entities` item has the given `type`' },

  { kind: 'method', name: 'isForwarded', body: 'return this.raw.forward_origin != null', returnType: "this is Has<this, 'forwardOrigin'>", jsdoc: 'alias for `hasForwardOrigin()`' },
  { kind: 'method', name: 'isReply', body: 'return this.raw.reply_to_message != null', returnType: "this is Has<this, 'replyToMessage' | 'replyToMessageId'>", jsdoc: 'true if this message is a reply' },
  { kind: 'method', name: 'isMediaGroup', body: 'return this.raw.media_group_id != null', returnType: 'boolean', jsdoc: 'true if this message is part of a media group (album). use `await update.collectMediaGroup()` from `@puregram/flow` to fetch the full album' },
  { kind: 'method', name: 'isPrivate', body: "return this.raw.chat.type === 'private'", returnType: 'boolean', jsdoc: 'true if `chat.type === "private"`' },
  { kind: 'method', name: 'isGroup', body: "return this.raw.chat.type === 'group'", returnType: 'boolean', jsdoc: 'true if `chat.type === "group"` (strict — supergroups excluded)' },
  { kind: 'method', name: 'isSupergroup', body: "return this.raw.chat.type === 'supergroup'", returnType: 'boolean', jsdoc: 'true if `chat.type === "supergroup"`' },
  { kind: 'method', name: 'isChannel', body: "return this.raw.chat.type === 'channel'", returnType: 'boolean', jsdoc: 'true if `chat.type === "channel"`' },

  { kind: 'method', name: 'download', body: PICK_DOWNLOAD + 'return t == null ? Promise.resolve(null) : this.tg.download(t)', returnType: 'Promise<Buffer | null>', jsdoc: 'download the message attachment as a `Buffer`. returns `null` if the message has no media. auto-picks with priority `document > video > audio > voice > video_note > animation > live_photo > photo[largest] > sticker`' },
  { kind: 'method', name: 'downloadStream', body: PICK_DOWNLOAD + 'return t == null ? Promise.resolve(null) : this.tg.downloadStream(t)', returnType: 'Promise<import("node:stream").Readable | null>', jsdoc: 'download the message attachment as a node `Readable`. returns `null` if no media' },
  { kind: 'method', name: 'downloadIterable', body: PICK_DOWNLOAD + 'return t == null ? Promise.resolve(null) : this.tg.downloadIterable(t)', returnType: 'Promise<AsyncIterable<Uint8Array> | null>', jsdoc: 'download the message attachment as an async-iterable byte stream. returns `null` if no media' },
  { kind: 'method', name: 'downloadToFile', params: 'path: string', body: PICK_DOWNLOAD + 'return t == null ? Promise.resolve(null) : this.tg.downloadToFile(path, t).then(() => undefined as void | null)', returnType: 'Promise<void | null>', jsdoc: 'download the message attachment to disk. returns `null` if no media; otherwise resolves once the file is fully written' },

  { kind: 'method', name: 'createActionController', params: 'action: import("../telegram-like").ActionControllerLike["action"], options?: import("../telegram-like").ActionControllerParams', body: 'return this.tg.createActionController(this.raw.chat.id, action, { ...(this.raw.business_connection_id != null && { business_connection_id: this.raw.business_connection_id }), ...options })', returnType: 'import("../telegram-like").ActionControllerLike', jsdoc: 'create a controller that re-sends `sendChatAction(action)` every `interval` ms (default 5000) until `stop()` is called — telegram clears the action after ~5 seconds, so a long task needs it refreshed' },
  { kind: 'method', name: 'withChatAction', typeParams: '<T>', params: 'action: import("../telegram-like").ActionControllerLike["action"], fn: () => Promise<T> | T, options?: import("../telegram-like").ActionControllerParams', body: 'return this.tg.withChatAction(this.raw.chat.id, action, fn, { ...(this.raw.business_connection_id != null && { business_connection_id: this.raw.business_connection_id }), ...options })', returnType: 'Promise<T>', jsdoc: 'run `fn` while continuously sending `sendChatAction(action)`. the action auto-stops when `fn` settles — even if it throws — and `fn`\'s result is returned' },

  { kind: 'method', name: 'react', params: 'reaction: string | TelegramReactionType[], params?: Omit<import("./methods").SetMessageReactionParams, "chat_id" | "message_id" | "reaction">', body: 'return this.tg.api.setMessageReaction({ chat_id: this.raw.chat.id, message_id: this.raw.message_id, reaction: typeof reaction === "string" ? [{ type: "emoji", emoji: reaction }] : reaction, ...params })', returnType: 'Promise<true>', jsdoc: 'react to this message — an emoji string for the common case, or a reaction array for custom / multiple' }
]

const MESSAGE_REACTION_EXTRAS: UpdateExtra[] = [
  { kind: 'getter', name: 'added', expression: 'this.raw.new_reaction.filter(r => !this.raw.old_reaction.some(o => o.type === r.type && (o as { emoji?: string }).emoji === (r as { emoji?: string }).emoji && (o as { custom_emoji_id?: string }).custom_emoji_id === (r as { custom_emoji_id?: string }).custom_emoji_id))', returnType: 'TelegramReactionType[]', jsdoc: 'reactions present in `newReaction` but not in `oldReaction`' },
  { kind: 'getter', name: 'removed', expression: 'this.raw.old_reaction.filter(o => !this.raw.new_reaction.some(r => r.type === o.type && (r as { emoji?: string }).emoji === (o as { emoji?: string }).emoji && (r as { custom_emoji_id?: string }).custom_emoji_id === (o as { custom_emoji_id?: string }).custom_emoji_id))', returnType: 'TelegramReactionType[]', jsdoc: 'reactions present in `oldReaction` but not in `newReaction`' }
]

const CALLBACK_QUERY_EXTRAS: UpdateExtra[] = [
  { kind: 'getter', name: 'chatId', expression: 'this.raw.message?.chat.id', returnType: 'number | undefined', jsdoc: 'shortcut for `message?.chat.id`' },
  { kind: 'getter', name: 'messageId', expression: 'this.raw.message?.message_id', returnType: 'number | undefined', jsdoc: 'shortcut for `message?.message_id`' },
  { kind: 'getter', name: 'userId', expression: 'this.raw.from.id', returnType: 'number', jsdoc: 'shortcut for `from.id`' }
]

const CHAT_MEMBER_EXTRAS: UpdateExtra[] = [
  { kind: 'getter', name: 'oldStatus', expression: '(this.raw.old_chat_member as { status: string }).status', returnType: 'string', jsdoc: 'shortcut for `old_chat_member.status`' },
  { kind: 'getter', name: 'newStatus', expression: '(this.raw.new_chat_member as { status: string }).status', returnType: 'string', jsdoc: 'shortcut for `new_chat_member.status`' },

  { kind: 'method', name: 'wasCreator', body: "return (this.raw.old_chat_member as { status: string }).status === 'creator'", returnType: 'boolean', jsdoc: 'true if old status is `creator`' },
  { kind: 'method', name: 'isNowCreator', body: "return (this.raw.new_chat_member as { status: string }).status === 'creator'", returnType: 'boolean', jsdoc: 'true if new status is `creator`' },
  { kind: 'method', name: 'wasAdmin', body: "return (this.raw.old_chat_member as { status: string }).status === 'administrator'", returnType: 'boolean', jsdoc: 'true if old status is `administrator`' },
  { kind: 'method', name: 'isNowAdmin', body: "return (this.raw.new_chat_member as { status: string }).status === 'administrator'", returnType: 'boolean', jsdoc: 'true if new status is `administrator`' },
  { kind: 'method', name: 'wasMember', body: "return (this.raw.old_chat_member as { status: string }).status === 'member'", returnType: 'boolean', jsdoc: 'true if old status is `member`' },
  { kind: 'method', name: 'isNowMember', body: "return (this.raw.new_chat_member as { status: string }).status === 'member'", returnType: 'boolean', jsdoc: 'true if new status is `member`' },
  { kind: 'method', name: 'wasRestricted', body: "return (this.raw.old_chat_member as { status: string }).status === 'restricted'", returnType: 'boolean', jsdoc: 'true if old status is `restricted`' },
  { kind: 'method', name: 'isNowRestricted', body: "return (this.raw.new_chat_member as { status: string }).status === 'restricted'", returnType: 'boolean', jsdoc: 'true if new status is `restricted`' },
  { kind: 'method', name: 'wasLeft', body: "return (this.raw.old_chat_member as { status: string }).status === 'left'", returnType: 'boolean', jsdoc: 'true if old status is `left`' },
  { kind: 'method', name: 'isNowLeft', body: "return (this.raw.new_chat_member as { status: string }).status === 'left'", returnType: 'boolean', jsdoc: 'true if new status is `left`' },
  { kind: 'method', name: 'wasKicked', body: "return (this.raw.old_chat_member as { status: string }).status === 'kicked'", returnType: 'boolean', jsdoc: 'true if old status is `kicked` (banned)' },
  { kind: 'method', name: 'isNowKicked', body: "return (this.raw.new_chat_member as { status: string }).status === 'kicked'", returnType: 'boolean', jsdoc: 'true if new status is `kicked` (banned)' },

  { kind: 'method', name: 'didJoinChat', body: "const o = (this.raw.old_chat_member as { status: string }).status; const n = (this.raw.new_chat_member as { status: string }).status; return (o === 'left' || o === 'kicked') && n !== 'left' && n !== 'kicked'", returnType: 'boolean', jsdoc: 'true if the user was outside the chat (`left`/`kicked`) and is now in it' },
  { kind: 'method', name: 'didLeaveChat', body: "const o = (this.raw.old_chat_member as { status: string }).status; const n = (this.raw.new_chat_member as { status: string }).status; return o !== 'left' && o !== 'kicked' && (n === 'left' || n === 'kicked')", returnType: 'boolean', jsdoc: 'true if the user was in the chat and is now outside it (`left`/`kicked`)' },
  { kind: 'method', name: 'wasPromoted', body: "const o = (this.raw.old_chat_member as { status: string }).status; const n = (this.raw.new_chat_member as { status: string }).status; return o !== 'creator' && o !== 'administrator' && (n === 'creator' || n === 'administrator')", returnType: 'boolean', jsdoc: 'true if the user gained `creator` or `administrator` status' },
  { kind: 'method', name: 'wasDemoted', body: "const o = (this.raw.old_chat_member as { status: string }).status; const n = (this.raw.new_chat_member as { status: string }).status; return (o === 'creator' || o === 'administrator') && n !== 'creator' && n !== 'administrator'", returnType: 'boolean', jsdoc: 'true if the user lost `creator` or `administrator` status' },
  { kind: 'method', name: 'wasBanned', body: "return (this.raw.old_chat_member as { status: string }).status !== 'kicked' && (this.raw.new_chat_member as { status: string }).status === 'kicked'", returnType: 'boolean', jsdoc: 'true if the user was just kicked (banned)' },
  { kind: 'method', name: 'wasUnbanned', body: "return (this.raw.old_chat_member as { status: string }).status === 'kicked' && (this.raw.new_chat_member as { status: string }).status !== 'kicked'", returnType: 'boolean', jsdoc: 'true if the user was kicked and no longer is' }
]

// only kinds whose auto-detected anchors disagree with the v3 design; everything else
// flows from `autoAnchorsFor` and stays in lockstep with the schema
const TOP_LEVEL_ANCHOR_OVERRIDES: Record<string, ShortcutAnchor[]> = {
  deleted_business_messages: [],
  guest_message: [{ schemaArg: 'guest_query_id', accessPath: ['raw', 'guest_query_id'], nonNull: true }],
  chat_join_request: [
    { schemaArg: 'chat_id', accessPath: ['raw', 'chat', 'id'] },
    { schemaArg: 'chat_join_request_query_id', accessPath: ['raw', 'query_id'], nonNull: true }
  ],
  message_reaction: [],
  message_reaction_count: [],
  chat_boost: [],
  removed_chat_boost: []
}

// service-event derivations from a TelegramMessage payload — schema descriptions
// for these are inconsistent so we keep the list hand-curated
const DERIVED_KINDS: readonly UpdateKindSpec[] = [
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

const UNIVERSAL_EXTRAS: UpdateExtra[] = [
  { kind: 'getter', name: 'api', expression: 'this.tg.api', returnType: "TelegramLike['api']", jsdoc: 'shortcut for `tg.api` — call any bot api method directly from the wrapped update' }
]

const KIND_EXTRAS: Record<string, UpdateExtra[]> = {
  callback_query: CALLBACK_QUERY_EXTRAS,
  chat_member: CHAT_MEMBER_EXTRAS,
  my_chat_member: CHAT_MEMBER_EXTRAS,
  message_reaction: MESSAGE_REACTION_EXTRAS
}

export function buildUpdateKinds (schema: Schema) {
  const updateObj = schema.objects.find(o => o.name === 'Update')

  if (!updateObj || updateObj.kind !== 'object') {
    throw new Error('schema is missing the Update object')
  }

  const objectsByName = new Map<string, SchemaObject>(schema.objects.map(o => [o.name, o]))
  const topLevel: UpdateKindSpec[] = []

  for (const f of updateObj.fields) {
    if (f.name === 'update_id') {
      continue
    }

    if (f.type.kind !== 'reference') {
      continue
    }

    const refName = f.type.name
    const kindName = f.name
    const className = pascalCase(kindName) + 'Update'
    const payloadType = `Telegram${refName}`
    const anchors = TOP_LEVEL_ANCHOR_OVERRIDES[kindName] ?? autoAnchorsFor(refName, objectsByName)

    topLevel.push({
      kindName,
      className,
      payloadType,
      source: { kind: 'update-field', field: kindName },
      anchors
    })
  }

  const all: UpdateKindSpec[] = [...topLevel, ...DERIVED_KINDS.map(d => ({ ...d }))]

  for (const k of all) {
    let kindSpecific: UpdateExtra[] = []

    const kindExtras = KIND_EXTRAS[k.kindName]

    if (k.extras) {
      kindSpecific = k.extras
    } else if (k.payloadType === 'TelegramMessage') {
      kindSpecific = MESSAGE_EXTRAS
    } else if (kindExtras) {
      kindSpecific = kindExtras
    }

    k.extras = [...UNIVERSAL_EXTRAS, ...kindSpecific]
  }

  return all
}

function autoAnchorsFor (payloadName: string, objectsByName: Map<string, SchemaObject>) {
  if (payloadName === 'Message') {
    return MESSAGE_ANCHORS
  }

  const obj = objectsByName.get(payloadName)

  if (!obj || obj.kind !== 'object') {
    return []
  }

  if (/Query$/.test(payloadName)) {
    const idField = obj.fields.find(f => f.name === 'id' && f.type.kind === 'string')

    if (idField) {
      return [{ schemaArg: pascalToSnake(payloadName) + '_id', accessPath: ['raw', 'id'] }]
    }
  }

  const chatField = obj.fields.find(f => f.name === 'chat' && f.type.kind === 'reference' && f.type.name === 'Chat')

  if (chatField) {
    return [{ schemaArg: 'chat_id', accessPath: ['raw', 'chat', 'id'] }]
  }

  return []
}

function pascalCase (snake: string) {
  return snake.split('_').map(s => s ? s[0]!.toUpperCase() + s.slice(1) : '').join('')
}

function pascalToSnake (pascal: string) {
  return pascal.replace(/[A-Z]/g, (m, i: number) => (i === 0 ? '' : '_') + m.toLowerCase())
}
