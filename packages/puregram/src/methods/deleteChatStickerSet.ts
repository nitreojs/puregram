export interface DeleteChatStickerSetParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  [key: string]: any;
}

/**
 * Use this method to delete a group sticker set from a supergroup.
 * The bot must be an administrator in the chat for this to work and
 * must have the appropriate admin rights.
 * Use the field `can_set_sticker_set` optionally returned in `getChat`
 * requests to check if the bot can use this method.
 *
 * Returns `true` on success.
 */
export type deleteChatStickerSet = (
  params: DeleteChatStickerSetParams
) => Promise<true>;
