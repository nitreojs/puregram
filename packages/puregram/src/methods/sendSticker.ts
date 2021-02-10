import { TelegramInputFile } from '../types';

import {
  ReplyMarkupUnion,
  TelegramMessage
} from '../interfaces';

export interface SendStickerParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Sticker to send.
   * Pass a `file_id` as String to send a sticker that exists on the
   * Telegram servers (recommended), pass an **HTTP URL** as a String
   * for Telegram to get an sticker from the Internet,
   * or upload a new one using `multipart/form-data`.
   */
  sticker: TelegramInputFile;

  /**
   * Sends the message silently. Users will receive a notification with
   * no sound.
   */
  disable_notification?: boolean;

  /** If the message is a reply, ID of the original message */
  reply_to_message_id?: number;

  /**
   * Pass `true`, if the message should be sent even if
   * the specified replied-to message is not found
   */
  allow_sending_without_reply?: boolean;

  /**
   * Additional interface options.
   * A JSON-serialized object for an inline keyboard, custom reply keyboard,
   * instructions to remove reply keyboard or to force a reply from the user.
   */
  reply_markup?: ReplyMarkupUnion;

  [key: string]: any;
}

/**
 * Use this method to send static .WEBP or animated .TGS stickers.
 *
 * On success, the sent `Message` is returned.
 */
export type sendSticker = (params: SendStickerParams) => Promise<TelegramMessage>;
