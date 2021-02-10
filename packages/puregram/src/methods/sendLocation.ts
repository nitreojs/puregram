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
   * The radius of uncertainty for the location, measured in meters; `0-1500`
   */
  horizontal_accuracy?: number;

  /**
   * Period in seconds for which the location will be updated
   * (see Live Locations, should be between `60` and `86400`).
   */
  live_period?: number;

  /**
   * For live locations, a direction in which the user is moving, in degrees.
   * Must be between `1` and `360` if specified.
   */
  heading?: number;

  /**
   * For live locations, a maximum distance for proximity alerts about approaching another chat member,
   * in meters.
   * Must be between `1` and `100000` if specified.
   */
  proximity_alert_radius?: number;

  /**
   * Sends the message silently. Users will receive a notification with
   * no sound.
   */
  disable_notification?: boolean;

  /** If the message is a reply, ID of the original message */
  reply_to_message_id?: number;

  /**
   * Pass `true`, if the message should be sent even if the
   * specified replied-to message is not found
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
 * Use this method to send point on the map.
 *
 * On success, the sent `Message` is returned.
 */
export type sendLocation = (params: SendLocationParams) => Promise<TelegramMessage>;
