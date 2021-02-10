import { TelegramChatMember } from '../interfaces';

export interface GetChatAdministratorsParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  [key: string]: any;
}

/**
 * Use this method to get a list of administrators in a chat.
 *
 * On success, returns an `Array of ChatMember` objects that contains
 * information about all chat administrators except other bots.
 *
 * If the chat is a group or a supergroup and no administrators were appointed,
 * only the creator will be returned.
 */
export type getChatAdministrators = (
  params: GetChatAdministratorsParams
) => Promise<TelegramChatMember[]>;
