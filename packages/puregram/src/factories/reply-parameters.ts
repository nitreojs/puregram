import type { TelegramReplyParameters } from '@puregram/api'

/**
 * static factories for `ReplyParameters` — passed as `reply_parameters` in
 * `sendMessage`, `sendPhoto`, etc.
 *
 * @example
 * ```ts
 * tg.send(chat, 'pong', { reply_parameters: ReplyParameters.to(originalMessageId) })
 * tg.send(chat, 'pong', { reply_parameters: ReplyParameters.quote(msgId, 'why?') })
 * tg.send(chat, 'cross-chat', {
 *   reply_parameters: ReplyParameters.cross(otherChatId, msgId, { allow_sending_without_reply: true })
 * })
 * ```
 */
export class ReplyParameters {
  /** reply to a message in the current chat */
  static to (
    messageId: number,
    params: Omit<TelegramReplyParameters, 'message_id' | 'chat_id'> = {}
  ) {
    return { message_id: messageId, ...params }
  }

  /** reply to a message in a different chat (cross-chat reply) */
  static cross (
    chatId: number | string,
    messageId: number,
    params: Omit<TelegramReplyParameters, 'message_id' | 'chat_id'> = {}
  ) {
    return { message_id: messageId, chat_id: chatId, ...params }
  }

  /** reply with a quoted excerpt from the original message */
  static quote (
    messageId: number,
    quote: TelegramReplyParameters['quote'],
    params: Omit<TelegramReplyParameters, 'message_id' | 'chat_id' | 'quote'> = {}
  ) {
    return { message_id: messageId, quote, ...params }
  }
}
