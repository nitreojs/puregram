import type { TelegramReplyParameters } from '@puregram/api'

import { type Camelize, unCamelize } from './camelize'

type ReplyExtras = Camelize<Omit<TelegramReplyParameters, 'message_id' | 'chat_id'>>
type QuoteExtras = Camelize<Omit<TelegramReplyParameters, 'message_id' | 'chat_id' | 'quote'>>

/**
 * static factories for `ReplyParameters` — passed as `reply_parameters` in
 * `sendMessage`, `sendPhoto`, etc.
 *
 * @example
 * ```ts
 * tg.send(chat, 'pong', { reply_parameters: ReplyParameters.to(originalMessageId) })
 * tg.send(chat, 'pong', { reply_parameters: ReplyParameters.quote(msgId, 'why?') })
 * tg.send(chat, 'cross-chat', {
 *   reply_parameters: ReplyParameters.cross(otherChatId, msgId, { allowSendingWithoutReply: true })
 * })
 * ```
 */
export class ReplyParameters {
  /** reply to a message in the current chat */
  static to (messageId: number, params: ReplyExtras = {} as ReplyExtras) {
    return { message_id: messageId, ...unCamelize(params) }
  }

  /** reply to a message in a different chat (cross-chat reply) */
  static cross (chatId: number | string, messageId: number, params: ReplyExtras = {} as ReplyExtras) {
    return { message_id: messageId, chat_id: chatId, ...unCamelize(params) }
  }

  /** reply with a quoted excerpt from the original message */
  static quote (
    messageId: number,
    quote: NonNullable<TelegramReplyParameters['quote']>,
    params: QuoteExtras = {} as QuoteExtras
  ) {
    return { message_id: messageId, quote, ...unCamelize(params) }
  }
}
