import * as Interfaces from '../../generated'

import type { OneOf, Optional } from '../../types/types'

/**
 * This class provides static methods for easier creation of `InlineQueryResultCached*` objects,
 * just like the `InlineQueryResult` class does for `InlineQueryResult*` objects
 *
 * @example
 * context.answerInlineQuery([
 *   InlineQueryResult.cached.audio({
 *     id,
 *     audio_file_id: fileId,
 *     caption: 'definitely a cached audio!'
 *   })
 * ])
 */
export class InlineQueryResultCached {
  /** Creates an `InlineQueryResultCachedAudio` object */
  static audio (
    params: Optional<Interfaces.TelegramInlineQueryResultCachedAudio, 'type'>
  ): Interfaces.TelegramInlineQueryResultCachedAudio {
    return {
      type: 'audio',
      ...params
    }
  }

  /** Creates an `InlineQueryResultCachedDocument` object */
  static document (
    params: Optional<Interfaces.TelegramInlineQueryResultCachedDocument, 'type'>
  ): Interfaces.TelegramInlineQueryResultCachedDocument {
    return {
      type: 'document',
      ...params
    }
  }

  /** Creates an `InlineQueryResultCachedGif` object */
  static gif (
    params: Optional<Interfaces.TelegramInlineQueryResultCachedGif, 'type'>
  ): Interfaces.TelegramInlineQueryResultCachedGif {
    return {
      type: 'gif',
      ...params
    }
  }

  /** Creates an `InlineQueryResultCachedMpeg4Gif` object */
  static mpeg4Gif (
    params: Optional<Interfaces.TelegramInlineQueryResultCachedMpeg4Gif, 'type'>
  ): Interfaces.TelegramInlineQueryResultCachedMpeg4Gif {
    return {
      type: 'mpeg4_gif',
      ...params
    }
  }

  /** Creates an `InlineQueryResultCachedPhoto` object */
  static photo (
    params: Optional<Interfaces.TelegramInlineQueryResultCachedPhoto, 'type'>
  ): Interfaces.TelegramInlineQueryResultCachedPhoto {
    return {
      type: 'photo',
      ...params
    }
  }

  /** Creates an `InlineQueryResultCachedSticker` object */
  static sticker (
    params: Optional<Interfaces.TelegramInlineQueryResultCachedSticker, 'type'>
  ): Interfaces.TelegramInlineQueryResultCachedSticker {
    return {
      type: 'sticker',
      ...params
    }
  }

  /** Creates an `InlineQueryResultCachedVideo` object */
  static video (
    params: Optional<Interfaces.TelegramInlineQueryResultCachedVideo, 'type'>
  ): Interfaces.TelegramInlineQueryResultCachedVideo {
    return {
      type: 'video',
      ...params
    }
  }

  /** Creates an `InlineQueryResultCachedAudio` object */
  static voice (
    params: Optional<Interfaces.TelegramInlineQueryResultCachedVoice, 'type'>
  ): Interfaces.TelegramInlineQueryResultCachedVoice {
    return {
      type: 'voice',
      ...params
    }
  }
}

/**
 * This class provides static methods for easier creation of `InlineQueryResult*` objects
 *
 * @example
 * context.answerInlineQuery([
 *   InlineQueryResult.article({
 *     id,
 *     title: 'definitely an article!',
 *     input_message_content: InputMessageContent.text('definitely a message!')
 *   })
 * ])
 */
export class InlineQueryResult {
  static cached = InlineQueryResultCached

  /** Creates an `InlineQueryResultsButton` button that will be shown above inline query results */
  static button (
    text: string,
    params: OneOf<Optional<Interfaces.TelegramInlineQueryResultsButton, 'text'>, 'web_app' | 'start_parameter'>
  ): Interfaces.TelegramInlineQueryResultsButton {
    return {
      text,
      ...params
    }
  }

  /** Creates an `InlineQueryResultArticle` object */
  static article (
    params: Optional<Interfaces.TelegramInlineQueryResultArticle, 'type'>
  ): Interfaces.TelegramInlineQueryResultArticle {
    return {
      type: 'article',
      ...params
    }
  }

  /** Creates an `InlineQueryResultAudio` object */
  static audio (
    params: Optional<Interfaces.TelegramInlineQueryResultAudio, 'type'>
  ): Interfaces.TelegramInlineQueryResultAudio {
    return {
      type: 'audio',
      ...params
    }
  }

  /** Creates an `InlineQueryResultContact` object */
  static contact (
    params: Optional<Interfaces.TelegramInlineQueryResultContact, 'type'>
  ): Interfaces.TelegramInlineQueryResultContact {
    return {
      type: 'contact',
      ...params
    }
  }

  /** Creates an `InlineQueryResultGame` object */
  static game (
    params: Optional<Interfaces.TelegramInlineQueryResultGame, 'type'>
  ): Interfaces.TelegramInlineQueryResultGame {
    return {
      type: 'game',
      ...params
    }
  }

  /** Creates an `InlineQueryResultDocument` object */
  static document (
    params: Optional<Interfaces.TelegramInlineQueryResultDocument, 'type'>
  ): Interfaces.TelegramInlineQueryResultDocument {
    return {
      type: 'document',
      ...params
    }
  }

  /** Creates an `InlineQueryResultGif` object */
  static gif (
    params: Optional<Interfaces.TelegramInlineQueryResultGif, 'type'>
  ): Interfaces.TelegramInlineQueryResultGif {
    return {
      type: 'gif',
      ...params
    }
  }

  /** Creates an `InlineQueryResultLocation` object */
  static location (
    params: Optional<Interfaces.TelegramInlineQueryResultLocation, 'type'>
  ): Interfaces.TelegramInlineQueryResultLocation {
    return {
      type: 'location',
      ...params
    }
  }

  /** Creates an `InlineQueryResultMpeg4Gif` object */
  static mpeg4Gif (
    params: Optional<Interfaces.TelegramInlineQueryResultMpeg4Gif, 'type'>
  ): Interfaces.TelegramInlineQueryResultMpeg4Gif {
    return {
      type: 'mpeg4_gif',
      ...params
    }
  }

  /** Creates an `InlineQueryResultPhoto` object */
  static photo (
    params: Optional<Interfaces.TelegramInlineQueryResultPhoto, 'type'>
  ): Interfaces.TelegramInlineQueryResultPhoto {
    return {
      type: 'photo',
      ...params
    }
  }

  /** Creates an `InlineQueryResultVenue` object */
  static venue (
    params: Optional<Interfaces.TelegramInlineQueryResultVenue, 'type'>
  ): Interfaces.TelegramInlineQueryResultVenue {
    return {
      type: 'venue',
      ...params
    }
  }

  /** Creates an `InlineQueryResultVideo` object */
  static video (
    params: Optional<Interfaces.TelegramInlineQueryResultVideo, 'type'>
  ): Interfaces.TelegramInlineQueryResultVideo {
    return {
      type: 'video',
      ...params
    }
  }

  /** Creates an `InlineQueryResultVoice` object */
  static voice (
    params: Optional<Interfaces.TelegramInlineQueryResultVoice, 'type'>
  ): Interfaces.TelegramInlineQueryResultVoice {
    return {
      type: 'voice',
      ...params
    }
  }
}
