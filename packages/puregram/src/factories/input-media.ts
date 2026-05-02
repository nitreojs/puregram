import { InputMedia as GeneratedInputMedia } from '@puregram/api'

import type { InputMediaSticker, InputMediaVideoNote, InputMediaVoice } from './types'

/**
 * static factories for `InputMedia*` payloads, including synthetic
 * sticker/video_note/voice variants used by `tg.sendMedia(...)` polymorphic
 * dispatch (those aren't real bot api `InputMedia` variants — telegram has no
 * `sendMediaGroup` support for them, but the unified send shortcut understands
 * them)
 *
 * @example
 * ```ts
 * tg.sendMediaGroup(chat, [
 *   InputMedia.photo({ media: MediaSource.path('a.png') }),
 *   InputMedia.photo({ media: MediaSource.path('b.png'), caption: 'b' })
 * ])
 *
 * tg.sendMedia(chat, InputMedia.sticker({ media: MediaSource.path('cat.webp') }))
 * ```
 */
export class InputMedia extends GeneratedInputMedia {
  /** sticker variant — only valid as input to `tg.sendMedia(...)` */
  static sticker (params: Omit<InputMediaSticker, 'type'>) {
    return { type: 'sticker' as const, ...params }
  }

  /** video_note variant — only valid as input to `tg.sendMedia(...)` */
  static videoNote (params: Omit<InputMediaVideoNote, 'type'>) {
    return { type: 'video_note' as const, ...params }
  }

  /** voice variant — only valid as input to `tg.sendMedia(...)` */
  static voice (params: Omit<InputMediaVoice, 'type'>) {
    return { type: 'voice' as const, ...params }
  }
}
