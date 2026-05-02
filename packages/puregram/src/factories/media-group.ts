import type {
  Formattable,
  TelegramInputMediaAudio,
  TelegramInputMediaDocument,
  TelegramInputMediaPhoto,
  TelegramInputMediaVideo
} from '@puregram/api'

import type { MediaInput } from '../media-source'

type Media = MediaInput | string

interface GroupOptions {
  /** caption to attach to one of the items in the group */
  caption?: string | Formattable
  /** index of the item that gets the caption (default: 0 — telegram shows first item's caption as the album caption) */
  captionIndex?: number
}

function build (type: string, items: readonly Media[], opts: GroupOptions) {
  const idx = opts.captionIndex ?? 0
  const caption = opts.caption

  return items.map((media, i) => (
    caption !== undefined && i === idx
      ? { type, media, caption }
      : { type, media }
  ))
}

/**
 * static factories for `sendMediaGroup`-shaped arrays. each variant takes a
 * list of media inputs and an optional `caption` that gets attached to a
 * single item — by default the first one, since telegram displays the first
 * item's caption as the album-level caption
 *
 * @example
 * ```ts
 * tg.api.sendMediaGroup({
 *   chat_id,
 *   media: MediaGroup.photos([buf1, buf2, buf3], { caption: 'three photos' })
 * })
 *
 * // attach caption to a non-first item
 * tg.api.sendMediaGroup({
 *   chat_id,
 *   media: MediaGroup.videos([a, b, c], { caption: 'b', captionIndex: 1 })
 * })
 * ```
 */
export class MediaGroup {
  /** photo album */
  static photos (items: readonly Media[], opts: GroupOptions = {}) {
    return build('photo', items, opts) as TelegramInputMediaPhoto[]
  }

  /** video album (or photo+video mixed — passed alongside `MediaGroup.photos(...)` results) */
  static videos (items: readonly Media[], opts: GroupOptions = {}) {
    return build('video', items, opts) as TelegramInputMediaVideo[]
  }

  /** document group (must be uniform — all documents) */
  static documents (items: readonly Media[], opts: GroupOptions = {}) {
    return build('document', items, opts) as TelegramInputMediaDocument[]
  }

  /** audio group (must be uniform — all audio files) */
  static audios (items: readonly Media[], opts: GroupOptions = {}) {
    return build('audio', items, opts) as TelegramInputMediaAudio[]
  }
}
