import {
  TelegramInlineKeyboardMarkup,
  TelegramMessage,
  TelegramLabeledPrice
} from '../interfaces';

export interface SendInvoiceParams {
  /**
   * Unique identifier for the target private chat
   */
  chat_id: number;

  /**
   * Product name, 1-32 characters
   */
  title: string;

  /**
   * Product description, 1-255 characters
   */
  description: string;

  /**
   * Bot-defined invoice payload, 1-128 bytes.
   * This will not be displayed to the user, use for your internal processes.
   */
  payload: any;

  /**
   * Payments provider token, obtained via Botfather
   */
  provider_token: string;

  /**
   * Three-letter ISO 4217 currency code, see more on currencies
   */
  currency: string;

  /**
   * Price breakdown, a JSON-serialized list of components
   * (e.g. product price, tax, discount, delivery cost, delivery tax, bonus, etc.)
   */
  prices: TelegramLabeledPrice[];

  /**
   * Unique deep-linking parameter that can be used to generate this
   * invoice when used as a start parameter
   */
  start_parameter?: string;

  /**
   * The maximum accepted amount for tips in the smallest units of the currency
   * (integer, **not** float/double). For example, for a maximum tip of `US$ 1.45` pass
   * `max_tip_amount = 145`.
   * See the `exp` parameter in [currencies.json](https://core.telegram.org/bots/payments/currencies.json),
   * it shows the number of digits past the decimal point for each currency
   * (2 for the majority of currencies).
   * Defaults to `0`
   */
  max_tip_amount?: number;

  /**
   * A JSON-serialized array of suggested amounts of tips in the smallest units of the currency
   * (integer, **not** float/double). At most `4` suggested tip amounts can be specified.
   * The suggested tip amounts must be positive, passed in a strictly increased order
   * and must not exceed `max_tip_amount`.
   */
  suggested_tip_amounts?: number[];

  /**
   * A JSON-serialized data about the invoice,
   * which will be shared with the payment provider.
   * A detailed description of required fields should
   * be provided by the payment provider.
   */
  provider_data?: string;

  /**
   * URL of the product photo for the invoice.
   * Can be a photo of the goods or a marketing image for a service.
   * People like it better when they see what they are paying for.
   */
  photo_url?: string;

  /**
   * Photo size
   */
  photo_size?: number;

  /**
   * Photo width
   */
  photo_width?: number;

  /**
   * Photo height
   */
  photo_height?: number;

  /**
   * Pass `true`, if you require the user's full name to complete the order
   */
  need_name?: boolean;

  /**
   * Pass `true`, if you require the user's phone number to complete the order
   */
  need_phone_number?: boolean;

  /**
   * Pass `true`, if you require the user's email address to complete the order
   */
  need_email?: boolean;

  /**
   * Pass `true`, if you require the user's shipping address to complete the order
   */
  need_shipping_address?: boolean;

  /**
   * Pass `true`, if user's phone number should be sent to provider
   */
  send_phone_number_to_provider?: boolean;

  /**
   * Pass `true`, if user's email address should be sent to provider
   */
  send_email_to_provider?: boolean;

  /**
   * Pass `true`, if the final price depends on the shipping method
   */
  is_flexible?: boolean;

  /**
   * Sends the message silently.
   * Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /**
   * If the message is a reply, ID of the original message
   */
  reply_to_message_id?: number;

  /**
   * Pass `true`, if the message should be sent even if
   * the specified replied-to message is not found
   */
  allow_sending_without_reply?: boolean;

  /**
   * A JSON-serialized object for an inline keyboard.
   * If empty, one 'Pay total price' button will be shown.
   * If not empty, the first button must be a Pay button.
   */
  reply_markup?: TelegramInlineKeyboardMarkup;

  [key: string]: any;
}

/**
 * Use this method to send invoices.
 *
 * On success, the sent `Message` is returned.
 */
export type sendInvoice = (params: SendInvoiceParams) => Promise<TelegramMessage>;
