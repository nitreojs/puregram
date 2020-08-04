export interface DeleteStickerFromSetParams {
  /** File identifier of the sticker */
  sticker: string;
}

/**
 * Use this method to delete a sticker from a set created by the bot.
 *
 * Returns `true` on success.
 */
export type deleteStickerFromSet = (
  params: DeleteStickerFromSetParams
) => Promise<true>;
