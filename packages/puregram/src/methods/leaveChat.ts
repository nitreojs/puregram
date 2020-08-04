export interface LeaveChatParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;
}

/**
 * Use this method for your bot to leave a group, supergroup or channel.
 *
 * Returns `true` on success.
 */
export type leaveChat = (params: LeaveChatParams) => Promise<true>;
