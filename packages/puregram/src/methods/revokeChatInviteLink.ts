import { TelegramChatInviteLink } from '../interfaces';

export interface RevokeChatInviteLinkParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */

  chat_id: number | string;

  /** The invite link to edit */
  invite_link: string;

  [key: string]: any;
}

/**
 * Use this method to revoke an invite link created by the bot.
 * If the primary link is revoked, a new link is automatically generated.
 * The bot must be an administrator in the chat for this to work
 * and must have the appropriate admin rights.
 */
export type revokeChatInviteLink = (
  params: RevokeChatInviteLinkParams
) => Promise<TelegramChatInviteLink>;