import type { SendStickerParams, SendVideoNoteParams, SendVoiceParams } from '@puregram/api'

import type { MediaInput } from '../media-source'

// envelope fields shared across `sendX` — they live on the request, not on `InputMedia*`
type NonMediaParams =
  | 'business_connection_id'
  | 'chat_id'
  | 'message_thread_id'
  | 'direct_messages_topic_id'
  | 'disable_notification'
  | 'protect_content'
  | 'allow_paid_broadcast'
  | 'message_effect_id'
  | 'suggested_post_parameters'
  | 'reply_parameters'
  | 'reply_markup'

type MediaExtras<T, FieldKey extends keyof T> = Omit<T, FieldKey | NonMediaParams>

/**
 * synthetic InputMedia variant for `sendSticker` — used by `tg.sendMedia(...)`.
 * `media` swaps in for `sticker` at call time
 */
export type InputMediaSticker = MediaExtras<SendStickerParams, 'sticker'> & {
  type: 'sticker'
  media: MediaInput | string
}

/** synthetic InputMedia variant for `sendVideoNote` — see `InputMediaSticker` */
export type InputMediaVideoNote = MediaExtras<SendVideoNoteParams, 'video_note'> & {
  type: 'video_note'
  media: MediaInput | string
}

/** synthetic InputMedia variant for `sendVoice` — see `InputMediaSticker` */
export type InputMediaVoice = MediaExtras<SendVoiceParams, 'voice'> & {
  type: 'voice'
  media: MediaInput | string
}
