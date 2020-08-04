import { TelegramShippingOption } from '../interfaces';

export interface AnswerShippingQueryParams {
  /**
   * Unique identifier for the query to be answered
   */
  shipping_query_id: string;

  /**
   * Specify `true` if delivery to the specified address is possible
   * and `false` if there are any problems (for example, if delivery to
   * the specified address is not possible)
   */
  ok: boolean;

  /**
   * Required if ok is `true`.
   * A JSON-serialized array of available shipping options.
   */
  shipping_options?: TelegramShippingOption[];

  /**
   * Required if ok is `false`.
   * Error message in human readable form that explains why it
   * is impossible to complete the order (e.g. "Sorry, delivery to your
   * desired address is unavailable').
   * Telegram will display this message to the user.
   */
  error_message?: string;
}

/**
 * If you sent an invoice requesting a shipping address and the
 * parameter `is_flexible` was specified, the Bot API will send
 * an `Update` with a `shipping_query` field to the bot
 * Use this method to reply to shipping queries.
 *
 * On success, `true` is returned.
 */
export type answerShippingQuery = (params: AnswerShippingQueryParams) => Promise<true>;
