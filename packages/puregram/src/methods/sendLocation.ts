import {
  ReplyMarkupUnion,
  TelegramMessage
} from '../interfaces';

export interface SendLocationParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /** Latitude of the location */
  latitude: number;

  /** Longitude of the location */
  longitude: number;

  /**
   * Period in seconds for which the location will be updated
   * (see Live Locations, should be between `60` and `86400`).
   */
  live_period?: number;

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
 * Use this method to send point on the map.
 *
 * On success, the sent `Message` is returned.
 */
export type sendLocation = (params: SendLocationParams) => Promise<TelegramMessage>;
