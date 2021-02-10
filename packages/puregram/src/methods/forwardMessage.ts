import { TelegramMessage } from '../interfaces';

export interface ForwardMessageParams {
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

  /**
   * Sends the message silently.
   * Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /** Message identifier in the chat specified in from_chat_id */
  message_id: number;

  [key: string]: any;
}

/**
 * Use this method to forward messages of any kind.
 *
 * On success, the sent `Message` is returned.
 */
export type forwardMessage = (params: ForwardMessageParams) => Promise<TelegramMessage>;
