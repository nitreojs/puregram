import type {
  TelegramInputMediaAnimation,
  TelegramInputMediaAudio,
  TelegramInputMediaDocument,
  TelegramInputMediaPhoto,
  TelegramInputMediaVideo,
  TelegramInputRichMessageMedia
} from '@puregram/api'

import type { MediaInput } from '../media-source'

import { type Camelize, unCamelize } from './camelize'
import type { InputMediaVoice } from './types'

type Media = MediaInput | string

type Extras<T> = Camelize<Omit<T, 'type' | 'media'>>

/** the four `tg://<kind>?id=` link forms telegram documents for referencing a `media[]` entry */
export type RichMediaLinkKind = 'photo' | 'video' | 'document' | 'audio'

function entry (type: string, id: string, media: Media, params: object) {
  return {
    id,
    media: { type, media, ...unCamelize(params) }
  } as unknown as TelegramInputRichMessageMedia
}

/**
 * static factories for the `media[]` entries a raw `html` / `markdown` rich message references
 * through `tg://photo?id=`, `tg://video?id=`, `tg://document?id=` and `tg://audio?id=` links.
 * pair each with `RichMedia.link(...)` so the id is written once
 *
 * @example
 * ```ts
 * const id = 'note'
 *
 * await tg.api.sendRichMessage({
 *   chat_id,
 *   rich_message: {
 *     markdown: `here it is:\n\n<tg-document src="${RichMedia.link('document', id)}"></tg-document>`,
 *     media: [RichMedia.document(id, MediaSource.path('./note.txt'))]
 *   }
 * })
 * ```
 */
export class RichMedia {
  /** the `tg://<kind>?id=<id>` reference a dialect string points at an entry with */
  static link (kind: RichMediaLinkKind, id: string) {
    return `tg://${kind}?id=${id}`
  }

  static photo (id: string, media: Media, params: Extras<TelegramInputMediaPhoto> = {}) {
    return entry('photo', id, media, params)
  }

  static video (id: string, media: Media, params: Extras<TelegramInputMediaVideo> = {}) {
    return entry('video', id, media, params)
  }

  static audio (id: string, media: Media, params: Extras<TelegramInputMediaAudio> = {}) {
    return entry('audio', id, media, params)
  }

  static document (id: string, media: Media, params: Extras<TelegramInputMediaDocument> = {}) {
    return entry('document', id, media, params)
  }

  /** telegram documents no `tg://` link form for animations — reference it as a native block instead */
  static animation (id: string, media: Media, params: Extras<TelegramInputMediaAnimation> = {}) {
    return entry('animation', id, media, params)
  }

  /** telegram documents no `tg://` link form for voice notes — reference it as a native block instead */
  static voiceNote (id: string, media: Media, params: Extras<InputMediaVoice> = {}) {
    return entry('voice_note', id, media, params)
  }
}
