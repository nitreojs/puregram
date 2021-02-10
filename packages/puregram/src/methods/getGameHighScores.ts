import { TelegramGameHighScore } from '../interfaces';

export interface GetGameHighScoresParams {
  /**
   * Target user id
   */
  user_id: number;

  /**
   * Required if `inline_message_id` is not specified.
   * Unique identifier for the target chat
   */
  chat_id?: number;

  /**
   * Required if `inline_message_id` is not specified.
   * Identifier of the sent message
   */
  message_id?: number;

  /**
   * Required if `chat_id` and `message_id` are not specified.
   * Identifier of the inline message
   */
  inline_message_id?: string;

  [key: string]: any;
}

/**
 * Use this method to get data for high score tables.
 * Will return the score of the specified user and several of their neighbors
 * in a game.
 *
 * On success, returns an `Array of GameHighScore` objects.
 */
export type getGameHighScores = (
  params: GetGameHighScoresParams
) => Promise<TelegramGameHighScore[]>;
