import { ParseMode } from '../types';

import {
  ReplyMarkupUnion,
  TelegramMessage
} from '../interfaces';

export interface SendMessageParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Text of the message to be sent, 1-4096 characters after entities parsing
   */
  text: string;

  /** Mode for parsing entities in the message text */
  parse_mode?: ParseMode;

  /** Disables link previews for links in this message */
  disable_web_page_preview?: boolean;

  /**
   * Sends the message silently.
   * Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /** If the message is a reply, ID of the original message */
  reply_to_message_id?: number;

  /**
   * Additional interface options. A JSON-serialized object for an inline
   * keyboard, custom reply keyboard, instructions to remove reply keyboard or
   * to force a reply from the user.
   */
  reply_markup?: ReplyMarkupUnion;
}

/**
 * Use this method to send text messages.
 *
 * On success, the sent `Message` is returned.
 */
export type sendMessage = (params: SendMessageParams) => Promise<TelegramMessage>;
