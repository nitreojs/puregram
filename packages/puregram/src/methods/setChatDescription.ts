export interface SetChatDescriptionParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /** New chat description, 0-255 characters */
  description: string;

  [key: string]: any;
}

/**
 * Use this method to change the description of a group,
 * a supergroup or a channel. The bot must be an administrator in the chat
 * for this to work and must have the appropriate admin rights.
 *
 * Returns `true` on success.
 */
export type setChatDescription = (
  params: SetChatDescriptionParams
) => Promise<true>;
