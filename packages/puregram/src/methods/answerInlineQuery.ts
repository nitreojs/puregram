import { InlineQueryResultUnion } from '../interfaces';

export interface AnswerInlineQueryParams {
  /**
   * Unique identifier for the answered query
   */
  inline_query_id: string;

  /**
   * A JSON-serialized array of results for the inline query
   */
  results: InlineQueryResultUnion[];

  /**
   * The maximum amount of time in seconds that the result of the inline query
   * may be cached on the server. Defaults to `300`.
   */
  cache_time?: number;

  /**
   * Pass `true`, if results may be cached on the server side only for the use
   * that sent the query. By default, results may be returned to any user who
   * sends the same query
   */
  is_personal?: boolean;

  /**
   * Pass the offset that a client should send in the next query with the same
   * text to receive more results. Pass an empty string if there are no mor
   * results or if you don't support pagination. Offset length can't exceed
   * 64 bytes.
   */
  next_offset?: string;

  /**
   * If passed, clients will display a button with specified text that switches
   * the user to a private chat with the bot and sends the bot a start message
   * with the parameter `switch_pm_parameter`
   */
  switch_pm_text?: string;

  /**
   * Deep-linking parameter for the `/start` message sent to the bot when
   * user presses the switch button. 1-64 characters, only `A-Z`, `a-z`, `0-9`,
   * `_` and `-` are allowed.
   */
  switch_pm_parameter?: string;
}

/**
 * Use this method to send answers to an inline query.
 *
 * On success, `true` is returned.
 *
 * No more than `50` results per query are allowed.
 */
export type answerInlineQuery = (params: AnswerInlineQueryParams) => Promise<true>;
