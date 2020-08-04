import {
  TelegramInlineKeyboardMarkup,
  TelegramPoll
} from '../interfaces';

export interface StopPollParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /** Identifier of the original message with the poll */
  message_id: number;

  /** A JSON-serialized object for a new inline keyboard */
  reply_markup?: TelegramInlineKeyboardMarkup;
}

/**
 * Use this method to stop a poll which was sent by the bot.
 *
 * On success, the stopped `Poll` with the final results is returned.
 */
export type stopPoll = (params: StopPollParams) => Promise<TelegramPoll>;
