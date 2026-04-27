// canonical positional layout per Bot API method.
//
// consumed by both:
//   - emit-shortcuts.ts → telegram-level shortcuts (`tg.send(chat, text, params?)`)
//   - emit-updates.ts → per-update shortcuts (`message.send(text, params?)`,
//                       where anchor-matched entries are dropped because the
//                       update's anchor map already auto-fills them)
//
// to add a new positional later: add (or extend) the entry here and run `yarn emit`.
export interface MethodPositional {
  name: string
  schemaArg: string
}

export const METHOD_POSITIONALS: Record<string, MethodPositional[]> = {
  // outgoing content — `chat` first, then the primary payload
  sendMessage: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'text', schemaArg: 'text' }],
  sendMessageDraft: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'text', schemaArg: 'text' }],
  sendPhoto: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'photo', schemaArg: 'photo' }],
  sendAudio: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'audio', schemaArg: 'audio' }],
  sendDocument: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'document', schemaArg: 'document' }],
  sendVideo: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'video', schemaArg: 'video' }],
  sendAnimation: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'animation', schemaArg: 'animation' }],
  sendVoice: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'voice', schemaArg: 'voice' }],
  sendVideoNote: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'videoNote', schemaArg: 'video_note' }],
  sendSticker: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'sticker', schemaArg: 'sticker' }],
  sendLocation: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'latitude', schemaArg: 'latitude' }, { name: 'longitude', schemaArg: 'longitude' }],
  sendVenue: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'latitude', schemaArg: 'latitude' }, { name: 'longitude', schemaArg: 'longitude' }, { name: 'title', schemaArg: 'title' }, { name: 'address', schemaArg: 'address' }],
  sendContact: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'phoneNumber', schemaArg: 'phone_number' }, { name: 'firstName', schemaArg: 'first_name' }],
  sendDice: [{ name: 'chat', schemaArg: 'chat_id' }],
  sendChatAction: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'action', schemaArg: 'action' }],
  sendPoll: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'question', schemaArg: 'question' }, { name: 'options', schemaArg: 'options' }],
  sendChecklist: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'checklist', schemaArg: 'checklist' }],
  sendMediaGroup: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'media', schemaArg: 'media' }],
  sendPaidMedia: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'starCount', schemaArg: 'star_count' }, { name: 'media', schemaArg: 'media' }],
  sendGame: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'gameShortName', schemaArg: 'game_short_name' }],

  // forward / copy: `from` (source chat) → `to` (destination chat) → message id(s)
  forwardMessage: [{ name: 'from', schemaArg: 'from_chat_id' }, { name: 'to', schemaArg: 'chat_id' }, { name: 'messageId', schemaArg: 'message_id' }],
  forwardMessages: [{ name: 'from', schemaArg: 'from_chat_id' }, { name: 'to', schemaArg: 'chat_id' }, { name: 'messageIds', schemaArg: 'message_ids' }],
  copyMessage: [{ name: 'from', schemaArg: 'from_chat_id' }, { name: 'to', schemaArg: 'chat_id' }, { name: 'messageId', schemaArg: 'message_id' }],
  copyMessages: [{ name: 'from', schemaArg: 'from_chat_id' }, { name: 'to', schemaArg: 'chat_id' }, { name: 'messageIds', schemaArg: 'message_ids' }],

  // chat-message ops
  deleteMessage: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'messageId', schemaArg: 'message_id' }],
  deleteMessages: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'messageIds', schemaArg: 'message_ids' }],
  pinChatMessage: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'messageId', schemaArg: 'message_id' }],
  unpinChatMessage: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'messageId', schemaArg: 'message_id' }],
  setMessageReaction: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'messageId', schemaArg: 'message_id' }, { name: 'reactions', schemaArg: 'reaction' }],

  // member ops
  banChatMember: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'user', schemaArg: 'user_id' }],
  unbanChatMember: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'user', schemaArg: 'user_id' }],

  // edits — `chat`/`messageId` only positional at telegram level; per-update auto-fills both
  // via anchors so user code only sees the primary payload arg
  editMessageText: [{ name: 'text', schemaArg: 'text' }],
  editMessageMedia: [{ name: 'media', schemaArg: 'media' }],
  editMessageLiveLocation: [{ name: 'latitude', schemaArg: 'latitude' }, { name: 'longitude', schemaArg: 'longitude' }]
}

// telegram-level shortcuts — curated subset emitted onto `Telegram` itself.
// `verb` is the public name (rename allowed). positional layout comes from METHOD_POSITIONALS.
export interface ShortcutSpec {
  verb: string
  method: string
}

export const SHORTCUTS: ShortcutSpec[] = [
  { verb: 'send', method: 'sendMessage' },
  { verb: 'sendPhoto', method: 'sendPhoto' },
  { verb: 'sendAudio', method: 'sendAudio' },
  { verb: 'sendDocument', method: 'sendDocument' },
  { verb: 'sendVideo', method: 'sendVideo' },
  { verb: 'sendAnimation', method: 'sendAnimation' },
  { verb: 'sendVoice', method: 'sendVoice' },
  { verb: 'sendVideoNote', method: 'sendVideoNote' },
  { verb: 'sendSticker', method: 'sendSticker' },
  { verb: 'sendLocation', method: 'sendLocation' },
  { verb: 'sendVenue', method: 'sendVenue' },
  { verb: 'sendContact', method: 'sendContact' },
  { verb: 'sendDice', method: 'sendDice' },
  { verb: 'sendChatAction', method: 'sendChatAction' },
  { verb: 'sendPoll', method: 'sendPoll' },
  { verb: 'sendMediaGroup', method: 'sendMediaGroup' },
  { verb: 'forward', method: 'forwardMessage' },
  { verb: 'forwardMany', method: 'forwardMessages' },
  { verb: 'copy', method: 'copyMessage' },
  { verb: 'copyMany', method: 'copyMessages' },
  { verb: 'delete', method: 'deleteMessage' },
  { verb: 'deleteMany', method: 'deleteMessages' },
  { verb: 'pin', method: 'pinChatMessage' },
  { verb: 'unpin', method: 'unpinChatMessage' },
  { verb: 'kick', method: 'banChatMember' },
  { verb: 'ban', method: 'banChatMember' },
  { verb: 'unban', method: 'unbanChatMember' },
  { verb: 'react', method: 'setMessageReaction' }
]
