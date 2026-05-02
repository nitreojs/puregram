import type {
  TelegramInputMediaAnimation,
  TelegramInputMediaAudio,
  TelegramInputMediaDocument,
  TelegramInputMediaPhoto,
  TelegramInputMediaVideo
} from '@puregram/api'

import type { MediaInput } from '../media-source'

import type { InputMediaSticker, InputMediaVideoNote, InputMediaVoice } from './types'

type Media = MediaInput | string

/**
 * static factories for `InputMedia*` payloads with v2-style positional `media`
 * arg. real bot api variants (photo/video/document/animation/audio) work with
 * `sendMediaGroup`; synthetic sticker/video_note/voice variants are accepted
 * only by `tg.sendMedia(...)` polymorphic dispatch
 *
 * @example
 * ```ts
 * tg.api.sendMediaGroup({
 *   chat_id,
 *   media: [
 *     InputMedia.photo(MediaSource.path('a.png')),
 *     InputMedia.photo(MediaSource.path('b.png'), { caption: 'b' })
 *   ]
 * })
 *
 * tg.sendMedia(chat, InputMedia.sticker(MediaSource.path('cat.webp')))
 * ```
 */
export class InputMedia {
  /** photo variant for `sendMediaGroup` / `editMessageMedia` */
  static photo (media: Media, params: Omit<TelegramInputMediaPhoto, 'type' | 'media'> = {}) {
    return { type: 'photo', media, ...params } as TelegramInputMediaPhoto
  }

  /** video variant for `sendMediaGroup` / `editMessageMedia` */
  static video (media: Media, params: Omit<TelegramInputMediaVideo, 'type' | 'media'> = {}) {
    return { type: 'video', media, ...params } as TelegramInputMediaVideo
  }

  /** document variant for `sendMediaGroup` / `editMessageMedia` */
  static document (media: Media, params: Omit<TelegramInputMediaDocument, 'type' | 'media'> = {}) {
    return { type: 'document', media, ...params } as TelegramInputMediaDocument
  }

  /** animation variant for `editMessageMedia` (cannot be in a media group) */
  static animation (media: Media, params: Omit<TelegramInputMediaAnimation, 'type' | 'media'> = {}) {
    return { type: 'animation', media, ...params } as TelegramInputMediaAnimation
  }

  /** audio variant for `sendMediaGroup` / `editMessageMedia` */
  static audio (media: Media, params: Omit<TelegramInputMediaAudio, 'type' | 'media'> = {}) {
    return { type: 'audio', media, ...params } as TelegramInputMediaAudio
  }

  /** sticker variant — only valid as input to `tg.sendMedia(...)` */
  static sticker (media: Media, params: Omit<InputMediaSticker, 'type' | 'media'> = {}) {
    return { type: 'sticker', media, ...params } as InputMediaSticker
  }

  /** video_note variant — only valid as input to `tg.sendMedia(...)` */
  static videoNote (media: Media, params: Omit<InputMediaVideoNote, 'type' | 'media'> = {}) {
    return { type: 'video_note', media, ...params } as InputMediaVideoNote
  }

  /** voice variant — only valid as input to `tg.sendMedia(...)` */
  static voice (media: Media, params: Omit<InputMediaVoice, 'type' | 'media'> = {}) {
    return { type: 'voice', media, ...params } as InputMediaVoice
  }
}
