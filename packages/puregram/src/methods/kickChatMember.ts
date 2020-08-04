export interface KickChatMemberParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /** Unique identifier of the target user */
  user_id: number;

  /**
   * Date when the user will be unbanned, unix time.
   * If user is banned for more than `366 days` or less than `30 seconds`
   * from the current time they are considered to be banned **forever**
   */
  until_date?: number;
}

/**
 * Use this method to kick a user from a group, a supergroup or a channel.
 * In the case of supergroups and channels, the user will not be able to
 * return to the group on their own using invite links, etc., unless unbanned
 * first. The bot must be an administrator in the chat for this to work and
 * must have the appropriate admin rights.
 *
 * Returns `true` on success.
 */
export type kickChatMember = (params: KickChatMemberParams) => Promise<true>;
