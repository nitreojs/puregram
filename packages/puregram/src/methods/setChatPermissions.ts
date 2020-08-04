import { TelegramChatPermissions } from '../interfaces';

export interface SetChatPermissionsParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /** New default chat permissions */
  permissions: TelegramChatPermissions;
}

/**
 * Use this method to set default chat permissions for all members.
 * The bot must be an administrator in the group or a supergroup for this to
 * work and must have the can_restrict_members admin rights.
 *
 * Returns `true` on success.
 */
export type setChatPermissions = (
  params: SetChatPermissionsParams
) => Promise<true>;
