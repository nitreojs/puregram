import {
  TelegramMessage,
  TelegramInlineKeyboardMarkup
} from '../interfaces';

export interface StopMessageLiveLocationParams {
  /**
   * Required if `inline_message_id` is not specified.
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id?: number | string;

  /**
   * Required if `inline_message_id` is not specified.
   * Identifier of the message to edit
   */
  message_id?: number;

  /**
   * Required if `chat_id` and `message_id` are not specified.
   * Identifier of the inline message
   */
  inline_message_id?: number;

  /** A JSON-serialized object for a new inline keyboard */
  reply_markup?: TelegramInlineKeyboardMarkup;
}

/**
 * Use this method to stop updating a live location message before
 * `live_period` expires.
 *
 * On success, if the message was sent by the bot,
 * the sent `Message` is returned, otherwise `true` is returned.
 */
export type stopMessageLiveLocation = (
  params: StopMessageLiveLocationParams
) => Promise<TelegramMessage | true>;
