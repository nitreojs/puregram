export interface AnswerPreCheckoutQueryParams {
  /**
   * Unique identifier for the query to be answered
   */
  pre_checkout_query_id: string;

  /**
   * Specify `true` if everything is alright (goods are available, etc.)
   * and the bot is ready to proceed with the order.
   * Use `false` if there are any problems.
   */
  ok: boolean;

  /**
   * Required if ok is `false`.
   * Error message in human readable form that explains the reason for
   * failure to proceed with the checkout (e.g. "Sorry, somebody just
   * bought the last of our amazing black T-shirts while you were busy
   * filling out your payment details. Please choose a different color or
   * garment!"). Telegram will display this message to the user.
   */
  error_message?: string;
}

/**
 * Once the user has confirmed their payment and shipping details,
 * the Bot API sends the final confirmation in the form of an `Update`
 * with the field `pre_checkout_query`
 * Use this method to respond to such pre-checkout queries.
 *
 * On success, `true` is returned.
 *
 * **Note**: The Bot API **must** receive an answer within 10 seconds
 * after the pre-checkout query was sent.
 */
export type answerPreCheckoutQuery = (params: AnswerPreCheckoutQueryParams) => Promise<true>;
