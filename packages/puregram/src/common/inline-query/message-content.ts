import * as Interfaces from '../../generated'

import type { Optional, Formattable } from '../../types/types'

/**
 * This object represents the content of a message to be sent as a result of an inline query
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
export class InputMessageContent {
  /** Creates a `TelegramInputTextMessageContent` object */
  static text (
    text: string | Formattable,
    params: Optional<Interfaces.TelegramInputTextMessageContent, 'message_text'> = {}
  ): Interfaces.TelegramInputTextMessageContent {
    return {
      message_text: text,
      ...params
    }
  }

  /** Creates a `TelegramInputLocationMessageContent` object */
  static location (
    latitude: number,
    longitude: number,
    params: Optional<Interfaces.TelegramInputLocationMessageContent, 'latitude' | 'longitude'> = {}
  ): Interfaces.TelegramInputLocationMessageContent {
    return {
      latitude,
      longitude,
      ...params
    }
  }

  /** Creates a `TelegramInputVenueMessageContent` object */
  static venue (
    params: Interfaces.TelegramInputVenueMessageContent
  ): Interfaces.TelegramInputVenueMessageContent {
    return {
      ...params
    }
  }

  /** Creates a `TelegramInputContactMessageContent` object */
  static contact (
    params: Interfaces.TelegramInputContactMessageContent
  ): Interfaces.TelegramInputContactMessageContent {
    return {
      ...params
    }
  }

  /** Creates a `TelegramInputInvoiceMessageContent` object */
  static invoice (
    params: Interfaces.TelegramInputInvoiceMessageContent
  ): Interfaces.TelegramInputInvoiceMessageContent {
    return {
      ...params
    }
  }
}
