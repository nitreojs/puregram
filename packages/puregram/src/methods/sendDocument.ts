import {
  TelegramInputFile,
  ParseMode
} from '../types';

import {
  ReplyMarkupUnion,
  TelegramMessage
} from '../interfaces';

export interface SendDocumentParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * File to send.
   * Pass a `file_id` as String to send an document that exists on the
   * Telegram servers (recommended), pass an **HTTP URL** as a String
   * for Telegram to get an document from the Internet,
   * or upload a new one using `multipart/form-data`.
   */
  document: TelegramInputFile;

  /**
   * Document caption (may also be used when resending documents by `file_id`),
   * 0-1024 characters after entities parsing
   */
  caption?: string;

  /** Mode for parsing entities in the document caption */
  parse_mode?: ParseMode;

  /**
   * Thumbnail of the file sent;
   * can be ignored if thumbnail generation for the file is supporte
   * server-side. The thumbnail should be in **JPEG** format and less than
   * `200 kB` in size. A thumbnail's width and height should not exceed `320`.
   * Ignored if the file is not uploaded using `multipart/form-data`.
   * Thumbnails can't be reused and can be only uploaded as a new file,
   * so you can pass `attach://<file_attach_name>` if the thumbnail was
   * uploaded using `multipart/form-data` under `<file_attach_name>`.
   */
  thumb?: TelegramInputFile;

  /**
   * Sends the message silently. Users will receive a notification with
   * no sound.
   */
  disable_notification?: boolean;

  /** If the message is a reply, ID of the original message */
  reply_to_message_id?: number;

  /**
   * Additional interface options.
   * A JSON-serialized object for an inline keyboard, custom reply keyboard,
   * instructions to remove reply keyboard or to force a reply from the user.
   */
  reply_markup?: ReplyMarkupUnion;
}

/**
 * Use this method to send general files.
 *
 * On success, the sent `Message` is returned.
 * Bots can currently send files of any type of up to 50 MB in size,
 * this limit may be changed in the future.
 */
export type sendDocument = (params: SendDocumentParams) => Promise<TelegramMessage>;
