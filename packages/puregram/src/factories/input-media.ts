import type {
  Formattable,
  TelegramInputMediaAnimation,
  TelegramInputMediaAudio,
  TelegramInputMediaDocument,
  TelegramInputMediaPhoto,
  TelegramInputMediaVideo
} from '@puregram/api'

import type { MediaInput } from '../media-source'

import { type Camelize, unCamelize } from './camelize'
import type { InputMediaSticker, InputMediaVideoNote, InputMediaVoice } from './types'

type Media = MediaInput | string

type WithFormattableCaption<T> = 'caption' extends keyof T
  ? Omit<T, 'caption'> & { caption?: string | Formattable }
  : T

type PhotoExtras = WithFormattableCaption<Camelize<Omit<TelegramInputMediaPhoto, 'type' | 'media'>>>
type VideoExtras = WithFormattableCaption<Camelize<Omit<TelegramInputMediaVideo, 'type' | 'media'>>>
type DocumentExtras = WithFormattableCaption<Camelize<Omit<TelegramInputMediaDocument, 'type' | 'media'>>>
type AnimationExtras = WithFormattableCaption<Camelize<Omit<TelegramInputMediaAnimation, 'type' | 'media'>>>
type AudioExtras = WithFormattableCaption<Camelize<Omit<TelegramInputMediaAudio, 'type' | 'media'>>>
type StickerExtras = WithFormattableCaption<Camelize<Omit<InputMediaSticker, 'type' | 'media'>>>
type VideoNoteExtras = WithFormattableCaption<Camelize<Omit<InputMediaVideoNote, 'type' | 'media'>>>
type VoiceExtras = WithFormattableCaption<Camelize<Omit<InputMediaVoice, 'type' | 'media'>>>

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
 *     InputMedia.photo(MediaSource.path('b.png'), { caption: 'b', parseMode: 'HTML' })
 *   ]
 * })
 *
 * tg.sendMedia(chat, InputMedia.sticker(MediaSource.path('cat.webp')))
 * ```
 */
export class InputMedia {
  /** photo variant for `sendMediaGroup` / `editMessageMedia` */
  static photo (media: Media, params: PhotoExtras = {} as PhotoExtras) {
    return { type: 'photo', media, ...unCamelize(params) } as TelegramInputMediaPhoto
  }

  /** video variant for `sendMediaGroup` / `editMessageMedia` */
  static video (media: Media, params: VideoExtras = {} as VideoExtras) {
    return { type: 'video', media, ...unCamelize(params) } as TelegramInputMediaVideo
  }

  /** document variant for `sendMediaGroup` / `editMessageMedia` */
  static document (media: Media, params: DocumentExtras = {} as DocumentExtras) {
    return { type: 'document', media, ...unCamelize(params) } as TelegramInputMediaDocument
  }

  /** animation variant for `editMessageMedia` (cannot be in a media group) */
  static animation (media: Media, params: AnimationExtras = {} as AnimationExtras) {
    return { type: 'animation', media, ...unCamelize(params) } as TelegramInputMediaAnimation
  }

  /** audio variant for `sendMediaGroup` / `editMessageMedia` */
  static audio (media: Media, params: AudioExtras = {} as AudioExtras) {
    return { type: 'audio', media, ...unCamelize(params) } as TelegramInputMediaAudio
  }

  /** sticker variant — only valid as input to `tg.sendMedia(...)` */
  static sticker (media: Media, params: StickerExtras = {} as StickerExtras) {
    return { type: 'sticker', media, ...unCamelize(params) } as InputMediaSticker
  }

  /** video_note variant — only valid as input to `tg.sendMedia(...)` */
  static videoNote (media: Media, params: VideoNoteExtras = {} as VideoNoteExtras) {
    return { type: 'video_note', media, ...unCamelize(params) } as InputMediaVideoNote
  }

  /** voice variant — only valid as input to `tg.sendMedia(...)` */
  static voice (media: Media, params: VoiceExtras = {} as VoiceExtras) {
    return { type: 'voice', media, ...unCamelize(params) } as InputMediaVoice
  }
}
