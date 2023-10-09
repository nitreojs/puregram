import { Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Optional } from '../../types/types'

import { MediaInput } from '../media-source'

import * as Media from './types'

/**
 * This class provides static methods for easier `InputMedia` uploads
 *
 * @example
 * ```js
 * context.sendMediaGroup([
 *   InputMedia.photo(MediaSource.path(PATH_TO_FIRST_PHOTO)),
 *   InputMedia.photo(MediaSource.path(PATH_TO_SECOND_PHOTO), { caption: 'caption to second photo!' })
 * ])
 * ```
 *
 * It is also allowed to pass this as an argument to `sendMedia`:
 *
 * @example
 * ```js
 * context.sendMedia(
 *   InputMedia.document(MediaSource.path(PATH_TO_DOCUMENT), { caption: 'O_o' })
 * )
 * ```
 */
@Inspectable()
export class InputMedia {
  static animation (media: MediaInput, params?: Optional<Interfaces.TelegramInputMediaAnimation, 'type' | 'media'>):
    Interfaces.TelegramInputMediaAnimation {
    return {
      type: 'animation',
      media,
      ...params
    }
  }

  static audio (media: MediaInput, params?: Optional<Interfaces.TelegramInputMediaAudio, 'type' | 'media'>):
    Interfaces.TelegramInputMediaAudio {
    return {
      type: 'audio',
      media,
      ...params
    }
  }

  static document (media: MediaInput, params?: Optional<Interfaces.TelegramInputMediaDocument, 'type' | 'media'>):
    Interfaces.TelegramInputMediaDocument {
    return {
      type: 'document',
      media,
      ...params
    }
  }

  static photo (media: MediaInput, params?: Optional<Interfaces.TelegramInputMediaPhoto, 'type' | 'media'>):
    Interfaces.TelegramInputMediaPhoto {
    return {
      type: 'photo',
      media,
      ...params
    }
  }

  static video (media: MediaInput, params?: Optional<Interfaces.TelegramInputMediaVideo, 'type' | 'media'>):
    Interfaces.TelegramInputMediaVideo {
    return {
      type: 'video',
      media,
      ...params
    }
  }

  static sticker (media: MediaInput, params?: Optional<Media.InputMediaStickerOriginal, 'chat_id' | 'sticker'>):
    Media.InputMediaSticker {
    return {
      type: 'sticker',
      media,
      ...params
    }
  }

  static videoNote (media: MediaInput, params?: Optional<Media.InputMediaVideoNoteOriginal, 'chat_id' | 'video_note'>):
    Media.InputMediaVideoNote {
    return {
      type: 'video_note',
      media,
      ...params
    }
  }

  static voice (media: MediaInput, params?: Optional<Media.InputMediaVoiceOriginal, 'chat_id' | 'voice'>):
    Media.InputMediaVoice {
    return {
      type: 'voice',
      media,
      ...params
    }
  }
}
