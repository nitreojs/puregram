export interface AnswerCallbackQueryParams {
  /** Unique identifier for the query to be answered */
  callback_query_id: string;

  /**
   * Text of the notification.
   * If not specified, nothing will be shown to the user,
   * 0-200 characters
   */
  text?: string;

  /**
   * If `true`, an alert will be shown by the client instead of a notification
   * at the top of the chat screen. Defaults to `false`.
   */
  show_alert?: boolean;

  /**
   * URL that will be opened by the user's client.
   * If you have created a `Game` and accepted the conditions via `@Botfather`,
   * specify the URL that opens your game — note that this will only work
   * if the query comes from a `callback_game` button.
   *
   * Otherwise, you may use links like `t.me/your_bot?start=XXXX` that open
   * your bot with a parameter.
   */
  url?: string;

  /**
   * The maximum amount of time in seconds that the result of the callback
   * query may be cached client-side. Telegram apps will support caching
   * starting in version `3.14`. Defaults to `0`.
   */
  cache_time?: number;
}

/**
 * Use this method to send answers to callback queries sent from inline
 * keyboards. The answer will be displayed to the user as a notification at the
 * top of the chat screen or as an alert.
 *
 * On success, `true` is returned.
 */
export type answerCallbackQuery = (
  params: AnswerCallbackQueryParams
) => Promise<true>;
