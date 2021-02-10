import {
  TelegramInlineKeyboardMarkup,
  TelegramMessage
} from '../interfaces';

import {
  InlineKeyboard,
  InlineKeyboardBuilder
} from '../common/keyboards';

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

  /**
   * The radius of uncertainty for the location, measured in meters; `0-1500`
   */
  horizontal_accuracy?: number;

  /**
   * For live locations, a direction in which the user is moving, in degrees.
   * Must be between `1` and `360` if specified.
   */
  heading?: number;

  /**
   * For live locations, a maximum distance for proximity alerts about approaching another chat member,
   * in meters.
   * Must be between `1` and `100000` if specified.
   */
  proximity_alert_radius?: number;

  /** A JSON-serialized object for a new inline keyboard */
  reply_markup?: TelegramInlineKeyboardMarkup
    | InlineKeyboard
    | InlineKeyboardBuilder;

  [key: string]: any;
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
