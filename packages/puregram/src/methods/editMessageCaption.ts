import {
  TelegramMessage,
  TelegramInlineKeyboardMarkup
} from '../interfaces';

import { ParseMode } from '../types';

export interface EditMessageCaptionParams {
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

  /** New caption of the message, 0-1024 characters after entities parsing */
  caption: string;

  /** Mode for parsing entities in the message text */
  parse_mode?: ParseMode;

  /** Disables link previews for links in this message */
  disable_web_page_preview?: boolean;

  /** A JSON-serialized object for a new inline keyboard */
  reply_markup?: TelegramInlineKeyboardMarkup;
}

/**
 * Use this method to edit captions of messages.
 *
 * On success, if edited message is sent by the bot,
 * the edited `Message` is returned,
 * otherwise `true` is returned.
 */
export type editMessageCaption = (
  params: EditMessageCaptionParams
) => Promise<TelegramMessage | true>;
