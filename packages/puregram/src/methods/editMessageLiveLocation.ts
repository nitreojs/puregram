import {
  TelegramInlineKeyboardMarkup,
  TelegramMessage
} from '../interfaces';

import {
  InlineKeyboard,                                         InlineKeyboardBuilder                                 } from '../common/keyboards';

export interface EditMessageLiveLocationParams {
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

  /** Latitude of new location */
  latitude: number;

  /** Longitude of new location */
  longitude: number;

  /** A JSON-serialized object for a new inline keyboard */
  reply_markup?: TelegramInlineKeyboardMarkup
    | InlineKeyboard
    | InlineKeyboardBuilder;
}

/**
 * Use this method to edit live location messages.
 * A location can be edited until its `live_period` expires
 * or editing is explicitly disabled by a call to `stopMessageLiveLocation`.
 *
 * On success, if the edited message was sent by the bot,
 * the edited `Message` is returned, otherwise `true` is returned.
 */
export type editMessageLiveLocation = (
  params: EditMessageLiveLocationParams
) => Promise<TelegramMessage | true>;
