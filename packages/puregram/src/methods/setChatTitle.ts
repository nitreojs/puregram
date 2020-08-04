export interface SetChatTitleParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /** New chat title, 1-255 characters */
  title: string;
}

/**
 * Use this method to change the title of a chat.
 * Titles can't be changed for private chats.
 * The bot must be an administrator in the chat for this to work and
 * must have the appropriate admin rights.
 *
 * Returns `true` on success.
 */
export type setChatTitle = (params: SetChatTitleParams) => Promise<true>;
