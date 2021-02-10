import { TelegramChatPermissions } from '../interfaces';

export interface RestrictChatMemberParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /** Unique identifier of the target user */
  user_id: number;

  /** A JSON-serialized object for new user permissions */
  permissions: TelegramChatPermissions;

  /**
   * Date when restrictions will be lifted for the user, unix time.
   * If user is restricted for more than `366 days` or less than `30 seconds`
   * from the current time, they are considered to be restricted **forever**
   */
  until_date?: number;

  [key: string]: any;
}

/**
 * Use this method to restrict a user in a supergroup.
 * The bot must be an administrator in the supergroup for this to work
 * and must have the appropriate admin rights.
 * Pass `true` for all permissions to lift restrictions from a user.
 *
 * Returns `true` on success.
 */
export type restrictChatMember = (
  params: RestrictChatMemberParams
) => Promise<true>;
