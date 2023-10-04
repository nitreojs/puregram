import { Inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Optional } from '../types/types'

import { MediaInput } from './media-source'

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
 */
@Inspectable()
export class InputMedia {
  static animation (media: MediaInput, params: Optional<Interfaces.TelegramInputMediaAnimation, 'type' | 'media'>):
    Interfaces.TelegramInputMediaAnimation {
    return {
      type: 'animation',
      media,
      ...params
    }
  }

  static document (media: MediaInput, params: Optional<Interfaces.TelegramInputMediaDocument, 'type' | 'media'>):
    Interfaces.TelegramInputMediaDocument {
    return {
      type: 'document',
      media,
      ...params
    }
  }

  static audio (media: MediaInput, params: Optional<Interfaces.TelegramInputMediaAudio, 'type' | 'media'>):
    Interfaces.TelegramInputMediaAudio {
    return {
      type: 'audio',
      media,
      ...params
    }
  }

  static photo (media: MediaInput, params: Optional<Interfaces.TelegramInputMediaPhoto, 'type' | 'media'>):
    Interfaces.TelegramInputMediaPhoto {
    return {
      type: 'photo',
      media,
      ...params
    }
  }

  static video (media: MediaInput, params: Optional<Interfaces.TelegramInputMediaVideo, 'type' | 'media'>):
    Interfaces.TelegramInputMediaVideo {
    return {
      type: 'video',
      media,
      ...params
    }
  }
}
