import {
  TelegramMessage,
  InputMediaPhoto,
  InputMediaVideo
} from '../interfaces';

export interface SendMediaGroupParams {
  /**
   * Unique identifier for the target chat or username of the target channe
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * A JSON-serialized array describing photos and videos to be sent,
   * must include 2-10 items
   */
  media: (InputMediaPhoto | InputMediaVideo)[];

  /**
   * Sends the message silently. Users will receive a notification with
   * no sound.
   */
  disable_notification?: boolean;

  /** If the message is a reply, ID of the original message */
  reply_to_message_id?: number;
}

/**
 * Use this method to send a group of photos or videos as an album.
 *
 * On success, an `array of the sent Messages` is returned.
 */
export type sendMediaGroup = (params: SendMediaGroupParams) => Promise<TelegramMessage[]>;
