export interface ShortcutSpec {
  verb: string
  method: string
  positional: { name: string, schemaArg: string }[]
}

export const SHORTCUTS: ShortcutSpec[] = [
  { verb: 'send', method: 'sendMessage', positional: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'text', schemaArg: 'text' }] },
  { verb: 'forward', method: 'forwardMessage', positional: [{ name: 'from', schemaArg: 'from_chat_id' }, { name: 'to', schemaArg: 'chat_id' }, { name: 'messageId', schemaArg: 'message_id' }] },
  { verb: 'copy', method: 'copyMessage', positional: [{ name: 'from', schemaArg: 'from_chat_id' }, { name: 'to', schemaArg: 'chat_id' }, { name: 'messageId', schemaArg: 'message_id' }] },
  { verb: 'delete', method: 'deleteMessage', positional: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'messageId', schemaArg: 'message_id' }] },
  { verb: 'pin', method: 'pinChatMessage', positional: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'messageId', schemaArg: 'message_id' }] },
  { verb: 'unpin', method: 'unpinChatMessage', positional: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'messageId', schemaArg: 'message_id' }] },
  { verb: 'kick', method: 'banChatMember', positional: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'user', schemaArg: 'user_id' }] },
  { verb: 'ban', method: 'banChatMember', positional: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'user', schemaArg: 'user_id' }] },
  { verb: 'unban', method: 'unbanChatMember', positional: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'user', schemaArg: 'user_id' }] },
  { verb: 'react', method: 'setMessageReaction', positional: [{ name: 'chat', schemaArg: 'chat_id' }, { name: 'messageId', schemaArg: 'message_id' }, { name: 'reactions', schemaArg: 'reaction' }] }
]
