import {
  TelegramMessage,
  ReplyMarkupUnion
} from '../interfaces';

export interface SendContactParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /** Contact's phone number */
  phone_number: string;

  /** Contact's first name */
  first_name: string;

  /** Contact's last name */
  last_name?: string;

  /** Additional data about the contact in the form of a vCard, 0-2048 bytes */
  vcard?: string;

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
 * Use this method to send phone contacts.
 *
 * On success, the sent `Message` is returned.
 */
export type sendContact = (params: SendContactParams) => Promise<TelegramMessage>;
