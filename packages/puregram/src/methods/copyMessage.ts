import { ReplyMarkupUnion, TelegramMessageId } from '../interfaces';
import { ParseMode } from '../types';

export interface CopyMessageParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Unique identifier for the chat where the original message was sent (or
   * channel username in the format `@channelusername`)
   */
  from_chat_id: number | string;

  /** Message identifier in the chat specified in from_chat_id */
  message_id: number;

  /**
   * New caption for media,
   * `0-1024` characters after entities parsing.
   * If not specified, the original caption is kept
   */
  caption?: string;

  /** Mode for parsing entities in the new caption */
  parse_mode?: ParseMode;

  /**
   * Sends the message silently.
   * Users will receive a notification with no sound.
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
   * Additional interface options. A JSON-serialized object for an inline
   * keyboard, custom reply keyboard, instructions to remove reply keyboard or
   * to force a reply from the user.
   */
  reply_markup?: ReplyMarkupUnion;
}

/**
 * Use this method to copy messages of any kind.
 * The method is analogous to the method `forwardMessages`,
 * but the copied message doesn't have a link to the original message.
 * 
 * Returns the `MessageId` of the sent message on success.
 */
export type copyMessage = (params: CopyMessageParams) => Promise<TelegramMessageId>;
