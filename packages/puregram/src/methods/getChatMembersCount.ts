export interface GetChatMembersCountParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  [key: string]: any;
}

/**
 * Use this method to get the number of members in a chat.
 *
 * Returns `Int` on success.
 */
export type getChatMembersCount = (
  params: GetChatMembersCountParams
) => Promise<number>;
