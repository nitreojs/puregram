import {
  TelegramMessage,
  ReplyMarkupUnion
} from '../interfaces';

import {
  TelegramInputFile,
  ParseMode,
  MessageEntities
} from '../types';

export interface SendAudioParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Audio file to send.
   * Pass a `file_id` as String to send an audio file that exists on the
   * Telegram servers (recommended), pass an **HTTP URL** as a String
   * for Telegram to get an audio file from the Internet,
   * or upload a new one using `multipart/form-data`.
   */
  audio: TelegramInputFile;

  /** Audio caption, 0-1024 characters after entities parsing */
  caption?: string;

  /** Mode for parsing entities in the audio caption */
  parse_mode?: ParseMode;

  /**
   * List of special entities that appear in message text,
   * which can be specified instead of `parse_mode`
   */
  caption_entities?: MessageEntities;

  /** Duration of the audio in seconds */
  duration?: number;

  /** Performer */
  performer?: string;

  /** Track name */
  title?: string;

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
 * Use this method to send audio files, if you want Telegram clients to display
 * them in the music player. Your audio must be in the `.MP3` or `.M4A` format.
 *
 * On success, the sent `Message` is returned.
 * Bots can currently send audio files of up to 50 MB in size,
 * this limit may be changed in the future.
 *
 * For sending voice messages, use the sendVoice method instead.
 */
export type sendAudio = (params: SendAudioParams) => Promise<TelegramMessage>;
