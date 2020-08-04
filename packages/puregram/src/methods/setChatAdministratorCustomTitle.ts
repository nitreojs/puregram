export interface SetChatAdministratorCustomTitleParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /** Unique identifier of the target user */
  user_id: number;

  /**
   * New custom title for the administrator;
   * 0-16 characters, emoji are not allowed
   */
  custom_title: string;
}

/**
 * Use this method to set a custom title for an administrator in a supergroup
 * promoted by the bot.
 *
 * Returns True on success.
 */
export type setChatAdministratorCustomTitle = (
  params: SetChatAdministratorCustomTitleParams
) => Promise<true>;
