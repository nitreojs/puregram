export interface SetStickerPositionInSetParams {
  /** File identifier of the sticker */
  sticker: string;

  /** New sticker position in the set, 0-based */
  position: number;
}

/**
 * Use this method to move a sticker in a set created by the bot
 * to a specific position.
 *
 * Returns `true` on success.
 */
export type setStickerPositionInSet = (
  params: SetStickerPositionInSetParams
) => Promise<true>;
