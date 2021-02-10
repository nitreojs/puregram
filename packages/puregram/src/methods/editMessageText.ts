import { MessageEntities, ParseMode } from '../types';

import {
  TelegramInlineKeyboardMarkup,
  TelegramMessage
} from '../interfaces';

import {
  InlineKeyboard,
  InlineKeyboardBuilder
} from '../common/keyboards';

export interface EditMessageTextParams {
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

  /** New text of the message, 1-4096 characters after entities parsing */
  text: string;

  /** Mode for parsing entities in the message text */
  parse_mode?: ParseMode;

  /**
   * List of special entities that appear in message text,
   * which can be specified instead of `parse_mode`
   */
  entities?: MessageEntities;

  /** Disables link previews for links in this message */
  disable_web_page_preview?: boolean;

  /** A JSON-serialized object for a new inline keyboard */
  reply_markup?: TelegramInlineKeyboardMarkup
    | InlineKeyboard
    | InlineKeyboardBuilder;

  [key: string]: any;
}

/**
 * Use this method to edit text and game messages.
 *
 * On success, if edited message is sent by the bot,
 * the edited `Message` is returned,
 * otherwise `true` is returned.
 */
export type editMessageText = (
  params: EditMessageTextParams
) => Promise<TelegramMessage | true>;
