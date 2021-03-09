import { TelegramChatInviteLink } from '../interfaces';

export interface EditChatInviteLinkParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */

  chat_id: number | string;

  /** The invite link to edit */
  invite_link: string;

  /** Point in time (Unix timestamp) when the link will expire */
  expire_date?: number;

  /**
   * Maximum number of users that can be members of the chat
   * simultaneously after joining the chat via this invite link;
   * `1-99999`
   */
  member_limit?: number;

  [key: string]: any;
}

/**
 * Use this method to edit a non-primary invite link created by the bot.
 * The bot must be an administrator in the chat for this to work
 * and must have the appropriate admin rights.
 */
export type editChatInviteLink = (
  params: EditChatInviteLinkParams
) => Promise<TelegramChatInviteLink>;