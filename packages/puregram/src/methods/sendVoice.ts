import {
  TelegramInputFile,
  ParseMode,
  MessageEntities
} from '../types';

import {
  ReplyMarkupUnion,
  TelegramMessage
} from '../interfaces';

export interface SendVoiceParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Voice to send.
   * Pass a `file_id` as String to send a voice that exists on the
   * Telegram servers (recommended), pass an **HTTP URL** as a String
   * for Telegram to get a voice from the Internet, or upload a new photo
   * using `multipart/form-data`.
   */
  voice: TelegramInputFile;

  /** Voice message caption, 0-1024 characters after entities parsing */
  caption?: string;

  /** Mode for parsing entities in the voice message caption */
  parse_mode?: ParseMode;

  /**
   * List of special entities that appear in message text,
   * which can be specified instead of `parse_mode`
   */
  caption_entities?: MessageEntities;

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
 * the file as a playable voice message. For this to work, your audio must be
 * in an `.OGG` file encoded with `OPUS` (other formats may be sent a
 * `Audio` or `Document`).
 *
 * On success, the sent `Message` is returned.
 * Bots can currently send voice messages of up to 50 MB in size,
 * this limit may be changed in the future.
 */
export type sendVoice = (params: SendVoiceParams) => Promise<TelegramMessage>;
