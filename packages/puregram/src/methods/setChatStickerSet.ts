export interface SetChatStickerSetParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /** Name of the sticker set to be set as the group sticker set */
  sticker_set_name: string;
}

/**
 * Use this method to set a new group sticker set for a supergroup.
 * The bot must be an administrator in the chat for this to work and
 * must have the appropriate admin rights.
 * Use the field `can_set_sticker_set` optionally returned in `getChat`
 * requests to check if the bot can use this method.
 *
 * Returns `true` on success.
 */
export type setChatStickerSet = (
  params: SetChatStickerSetParams
) => Promise<true>;
