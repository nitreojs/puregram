import {
  TelegramMessage,
  InputMediaPhoto,
  InputMediaVideo,
  InputMediaAudio,
  InputMediaDocument
} from '../interfaces';

export interface SendMediaGroupParams {
  /**
   * Unique identifier for the target chat or username of the target channe
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /** A JSON-serialized array describing messages to be sent, must include `2-10` items */
  media: (InputMediaAudio | InputMediaDocument | InputMediaPhoto | InputMediaVideo)[];

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
}

/**
 * Use this method to send a group of photos or videos as an album.
 *
 * On success, an `array of the sent Messages` is returned.
 */
export type sendMediaGroup = (params: SendMediaGroupParams) => Promise<TelegramMessage[]>;
