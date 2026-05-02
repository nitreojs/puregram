import type {
  TelegramInputMediaAnimation,
  TelegramInputMediaAudio,
  TelegramInputMediaDocument,
  TelegramInputMediaPhoto,
  TelegramInputMediaVideo,
  TelegramMessage
} from '@puregram/api'

import type { InputMediaSticker, InputMediaVideoNote, InputMediaVoice } from '../factories'
import type { Telegram } from '../telegram'

/**
 * polymorphic media query accepted by `tg.sendMedia(chat, media)` — dispatches
 * to the corresponding `tg.api.sendX` based on the `type` discriminator. real
 * bot api `InputMedia*` variants (used by `sendMediaGroup`) carry a `media`
 * field; the synthetic sticker/video_note/voice variants reuse the same field
 * name, swapped at call time
 */
export type SendMediaQuery =
  | TelegramInputMediaPhoto
  | TelegramInputMediaVideo
  | TelegramInputMediaDocument
  | TelegramInputMediaAnimation
  | TelegramInputMediaAudio
  | InputMediaSticker
  | InputMediaVideoNote
  | InputMediaVoice

/** declarations for the handcrafted shortcuts that aren't in the codegen'd `TelegramShortcuts` */
export interface ManualShortcuts {
  /**
   * polymorphic shortcut: dispatches to `sendPhoto`/`sendVideo`/`sendSticker`/…
   * based on the `type` discriminator on the input. accepts both real bot api
   * `InputMedia*` shapes and synthetic sticker/video_note/voice shapes built by
   * `InputMedia.{sticker,videoNote,voice}(...)`
   *
   * @example
   * ```ts
   * tg.sendMedia(chat, InputMedia.photo({ media: MediaSource.path('cat.png'), caption: 'cat' }))
   * tg.sendMedia(chat, InputMedia.sticker({ media: MediaSource.fileId(stickerId) }))
   * ```
   */
  sendMedia: (
    chat: number | string,
    media: SendMediaQuery,
    params?: Record<string, unknown>
  ) => Promise<TelegramMessage>
}

const MEDIA_DISPATCH: Record<string, string> = {
  photo: 'sendPhoto',
  video: 'sendVideo',
  document: 'sendDocument',
  animation: 'sendAnimation',
  audio: 'sendAudio',
  sticker: 'sendSticker',
  video_note: 'sendVideoNote',
  voice: 'sendVoice'
}

export function installShortcuts (tg: Telegram) {
  define(tg, 'send', function (this: Telegram, chat: number | string, text: string, params: Record<string, unknown> = {}) {
    return (this.api as any).sendMessage({ chat_id: chat, text, ...params })
  })

  define(tg, 'sendMedia', function (this: Telegram, chat: number | string, media: SendMediaQuery, params: Record<string, unknown> = {}) {
    const method = MEDIA_DISPATCH[media.type]

    if (method === undefined) {
      throw new TypeError(`tg.sendMedia: unsupported media type '${(media as { type: string }).type}'`)
    }

    // swap the `media` surrogate field for the real per-type field name (sticker,
    // video_note, voice, photo, …) and drop `type` from the wire payload
    const { type, media: payload, ...rest } = media

    return (this.api as any)[method]({
      chat_id: chat,
      [type]: payload,
      ...rest,
      ...params
    })
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

  define(tg, 'react', function (
    this: Telegram,
    chat: number | string,
    messageId: number,
    reactions: unknown,
    params: Record<string, unknown> = {}
  ) {
    return (this.api as any).setMessageReaction({
      chat_id: chat,
      message_id: messageId,
      reaction: reactions,
      ...params
    })
  })
}

function define (target: Telegram, name: string, fn: (...args: any[]) => unknown) {
  Object.defineProperty(Object.getPrototypeOf(target), name, {
    value: fn,
    writable: true,
    configurable: true,
    enumerable: false
  })
}
