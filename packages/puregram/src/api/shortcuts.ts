import type { Telegram } from '../telegram'

export function installShortcuts (tg: Telegram): void {
  define(tg, 'send', function (this: Telegram, chat: number | string, text: string, params: Record<string, unknown> = {}) {
    return (this.api as any).sendMessage({ chat_id: chat, text, ...params })
  })

  define(tg, 'forward', function (this: Telegram, from: number | string, to: number | string, messageId: number, params: Record<string, unknown> = {}) {
    return (this.api as any).forwardMessage({ from_chat_id: from, chat_id: to, message_id: messageId, ...params })
  })

  define(tg, 'copy', function (this: Telegram, from: number | string, to: number | string, messageId: number, params: Record<string, unknown> = {}) {
    return (this.api as any).copyMessage({ from_chat_id: from, chat_id: to, message_id: messageId, ...params })
  })

  define(tg, 'delete', function (this: Telegram, chat: number | string, messageId: number) {
    return (this.api as any).deleteMessage({ chat_id: chat, message_id: messageId })
  })

  define(tg, 'pin', function (this: Telegram, chat: number | string, messageId: number, params: Record<string, unknown> = {}) {
    return (this.api as any).pinChatMessage({ chat_id: chat, message_id: messageId, ...params })
  })

  define(tg, 'unpin', function (this: Telegram, chat: number | string, messageId: number) {
    return (this.api as any).unpinChatMessage({ chat_id: chat, message_id: messageId })
  })

  define(tg, 'kick', function (this: Telegram, chat: number | string, user: number, params: Record<string, unknown> = {}) {
    return (this.api as any).banChatMember({ chat_id: chat, user_id: user, ...params })
  })

  define(tg, 'ban', function (this: Telegram, chat: number | string, user: number, params: Record<string, unknown> = {}) {
    return (this.api as any).banChatMember({ chat_id: chat, user_id: user, ...params })
  })

  define(tg, 'unban', function (this: Telegram, chat: number | string, user: number, params: Record<string, unknown> = {}) {
    return (this.api as any).unbanChatMember({ chat_id: chat, user_id: user, ...params })
  })

  define(tg, 'react', function (this: Telegram, chat: number | string, messageId: number, reactions: unknown, params: Record<string, unknown> = {}) {
    return (this.api as any).setMessageReaction({ chat_id: chat, message_id: messageId, reaction: reactions, ...params })
  })
}

function define (target: Telegram, name: string, fn: (...args: any[]) => unknown): void {
  Object.defineProperty(Object.getPrototypeOf(target), name, {
    value: fn,
    writable: true,
    configurable: true,
    enumerable: false
  })
}
