import {
  TelegramInputFile,
  ParseMode,
  MessageEntities
} from '../types';

import {
  ReplyMarkupUnion,
  TelegramMessage
} from '../interfaces';

export interface SendVideoParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Video to send.
   * Pass a `file_id` as String to send a video that exists on the
   * Telegram servers (recommended), pass an **HTTP URL** as a String
   * for Telegram to get an video from the Internet,
   * or upload a new one using `multipart/form-data`.
   */
  video: TelegramInputFile;

  /**
   * Document caption (may also be used when resending documents by `file_id`),
   * 0-1024 characters after entities parsing
   */
  caption?: string;

  /** Mode for parsing entities in the document caption */
  parse_mode?: ParseMode;

  /**
   * List of special entities that appear in message text,
   * which can be specified instead of `parse_mode`
   */
  caption_entities?: MessageEntities;

  /**
   * Thumbnail of the video sent;
   * can be ignored if thumbnail generation for the file is supporte
   * server-side. The thumbnail should be in **JPEG** format and less than
   * `200 kB` in size. A thumbnail's width and height should not exceed `320`.
   * Ignored if the file is not uploaded using `multipart/form-data`.
   * Thumbnails can't be reused and can be only uploaded as a new file,
   * so you can pass `attach://<file_attach_name>` if the thumbnail was
   * uploaded using `multipart/form-data` under `<file_attach_name>`.
   */
  thumb?: TelegramInputFile;

  /** Pass `true`, if the uploaded video is suitable for streaming */
  supports_streaming?: boolean;

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

  [key: string]: any;
}

/**
 * Use this method to send video files, Telegram clients support mp4 videos
 * (other formats may be sent as `Document`)
 *
 * On success, the sent `Message` is returned.
 * Bots can currently send video files of up to 50 MB in size,
 * this limit may be changed in the future.
 */
export type sendVideo = (params: SendVideoParams) => Promise<TelegramMessage>;
