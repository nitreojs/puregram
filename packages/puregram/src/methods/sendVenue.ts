import {
  TelegramMessage,
  ReplyMarkupUnion
} from '../interfaces';

export interface SendVenueParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /** Latitude of the venue */
  latitude: number;

  /** Longitude of the venue */
  longitude: number;

  /** Name of the venue */
  title: string;

  /** Address of the venue */
  address: string;

  /** Foursquare identifier of the venue */
  foursquare_id?: string;

  /** Foursquare type of the venue, if known */
  foursquare_type?: string;

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
 * Use this method to send information about a venue.
 *
 * On success, the sent `Message` is returned.
 */
export type sendVenue = (params: SendVenueParams) => Promise<TelegramMessage>;
