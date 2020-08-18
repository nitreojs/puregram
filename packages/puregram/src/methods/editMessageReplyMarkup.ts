import {
  TelegramMessage,
  TelegramInlineKeyboardMarkup
} from '../interfaces';

import {
  InlineKeyboard,                                         InlineKeyboardBuilder                                 } from '../common/keyboards';

export interface EditMessageReplyMarkupParams {
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
  reply_markup?: TelegramInlineKeyboardMarkup
    | InlineKeyboard
    | InlineKeyboardBuilder;
}

/**
 * Use this method to edit only the reply markup of messages.
 *
 * On success, if edited message is sent by the bot,
 * the edited `Message` is returned,
 * otherwise `true` is returned.
 */
export type editMessageReplyMarkup = (
  params: EditMessageReplyMarkupParams
) => Promise<TelegramMessage | true>;
