import type {
  TelegramInputContactMessageContent,
  TelegramInputInvoiceMessageContent,
  TelegramInputLocationMessageContent,
  TelegramInputTextMessageContent,
  TelegramInputVenueMessageContent
} from '@puregram/api'

/**
 * static factories for `InputMessageContent` payloads used by `InlineQueryResult*`
 *
 * unlike the other Input* families, the variants share no `type` discriminator
 * field — bot api disambiguates structurally (text vs latitude/longitude vs
 * phone_number vs payload). hand-crafted because the codegen pattern can't
 * encode the heterogeneous shape
 *
 * @example
 * ```ts
 * InlineQueryResult.article({
 *   id: '1', title: 't',
 *   input_message_content: InputMessageContent.text('hi', { parse_mode: 'HTML' })
 * })
 * InlineQueryResult.article({
 *   id: '2', title: 'pin',
 *   input_message_content: InputMessageContent.location(55.75, 37.61)
 * })
 * ```
 */
export class InputMessageContent {
  /** text message body */
  static text (
    text: string,
    params: Omit<TelegramInputTextMessageContent, 'message_text'> = {}
  ) {
    return { message_text: text, ...params }
  }

  /** location message body */
  static location (
    latitude: number,
    longitude: number,
    params: Omit<TelegramInputLocationMessageContent, 'latitude' | 'longitude'> = {}
  ) {
    return { latitude, longitude, ...params }
  }

  /** venue message body */
  static venue (
    latitude: number,
    longitude: number,
    title: string,
    address: string,
    params: Omit<TelegramInputVenueMessageContent, 'latitude' | 'longitude' | 'title' | 'address'> = {}
  ) {
    return { latitude, longitude, title, address, ...params }
  }

  /** contact message body */
  static contact (
    phoneNumber: string,
    firstName: string,
    params: Omit<TelegramInputContactMessageContent, 'phone_number' | 'first_name'> = {}
  ) {
    return { phone_number: phoneNumber, first_name: firstName, ...params }
  }

  /** invoice message body — too many required fields for a positional form, takes the full param object */
  static invoice (params: TelegramInputInvoiceMessageContent) {
    return params
  }
}
