import { TelegramChatMember } from '../interfaces';

export interface GetChatMemberParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /** Unique identifier of the target user */
  user_id: number;

  [key: string]: any;
}

/**
 * Use this method to get information about a member of a chat.
 *
 * Returns a `ChatMember` object on success.
 */
export type getChatMember = (
  params: GetChatMemberParams
) => Promise<TelegramChatMember>;
