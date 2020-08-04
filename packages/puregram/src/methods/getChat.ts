import { TelegramChatUnion } from '../interfaces';

export interface GetChatParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;
}

/**
 * Use this method to get up to date information about the chat
 * (current name of the user for one-on-one conversations,
 * current username of a user, group or channel, etc.). Returns a Chat object on success.
 */
export type getChat = (params: GetChatParams) => Promise<TelegramChatUnion>;
