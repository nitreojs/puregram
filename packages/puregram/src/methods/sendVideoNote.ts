import { TelegramInputFile } from '../types';

import {
  ReplyMarkupUnion,
  TelegramMessage
} from '../interfaces';

export interface SendVideoNoteParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Video note file to send.
   * Pass a `file_id` as String to send a video note file that exists on the
   * Telegram servers (recommended), pass an **HTTP URL** as a String
   * for Telegram to get an video note file from the Internet,
   * or upload a new one using `multipart/form-data`.
   */
  video_note: TelegramInputFile;

  /** Duration of the video note in seconds */
  duration?: number;

  /** Video width and height, i.e. diameter of the video message */
  length?: number;

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
}

/**
 * As of v.4.0, Telegram clients support rounded square mp4 videos of up to 1
 * minute long. Use this method to send video messages.
 *
 * On success, the sent `Message` is returned.
 */
export type sendVideoNote = (params: SendVideoNoteParams) => Promise<TelegramMessage>;
