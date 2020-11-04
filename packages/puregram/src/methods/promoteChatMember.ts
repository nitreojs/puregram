export interface PromoteChatMemberParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /** Unique identifier of the target user */
  user_id: number;

  /** Pass `true`, if the administrator's presence in the chat is hidden */
  is_anonymous?: boolean;

  /**
   * Pass `true`, if the administrator can change chat title,
   * photo and other settings
   */
  can_change_info?: boolean;

  /**
   * Pass `true`, if the administrator can create channel posts, channels only
   */
  can_post_messages?: boolean;

  /**
   * Pass `true`, if the administrator can edit messages of other users an
   * can pin messages, channels only
   */
  can_edit_messages?: boolean;

  /** Pass `true`, if the administrator can delete messages of other users */
  can_delete_messages?: boolean;

  /** Pass `true`, if the administrator can invite new users to the chat */
  can_invite_users?: boolean;

  /**
   * Pass `true`, if the administrator can restrict, ban or unban chat members
   */
  can_restrict_members?: boolean;

  /** Pass `true`, if the administrator can pin messages, supergroups only */
  can_pin_messages?: boolean;

  /**
   * Pass `true`, if the administrator can add new administrators with a subset
   * of their own privileges or demote administrators that he has promoted,
   * directly or indirectly (promoted by administrators that were appointed
   * by him)
   */
  can_promote_members?: boolean;
}

/**
 * Use this method to promote or demote a user in a supergroup or a channel.
 * The bot must be an administrator in the chat for this to work and
 * must have the appropriate admin rights.
 * Pass `false` for all boolean parameters to demote a user.
 *
 * Returns `true` on success.
 */
export type promoteChatMember = (
  params: PromoteChatMemberParams
) => Promise<true>;
