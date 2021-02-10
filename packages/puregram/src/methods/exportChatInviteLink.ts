export interface ExportChatInviteLinkParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  [key: string]: any;
}

/**
 * Use this method to generate a new invite link for a chat;
 * any previously generated link is revoked.
 * The bot must be an administrator in the chat for this to work
 * and must have the appropriate admin rights.
 *
 * Returns the new invite link as `String` on success.
 */
export type exportChatInviteLink = (
  params: ExportChatInviteLinkParams
) => Promise<string>;
