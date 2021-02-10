export interface UnbanChatMemberParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /** Unique identifier of the target user */
  user_id: number;

  /** Do nothing if the user is not banned */
  only_if_banned?: boolean;

  [key: string]: any;
}

/**
 * Use this method to unban a previously kicked user in a supergroup or channel.
 * The user will not return to the group or channel automatically,
 * but will be able to join via link, etc.
 * The bot must be an administrator for this to work.
 *
 * Returns `true` on success.
 */
export type unbanChatMember = (params: UnbanChatMemberParams) => Promise<true>;
