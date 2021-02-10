import { TelegramStickerSet } from '../interfaces';

export interface GetStickerSetParams {
  /** Name of the sticker set */
  name: string;

  [key: string]: any;
}

/**
 * Use this method to get a sticker set.
 *
 * On success, a `StickerSet` object is returned.
 */
export type getStickerSet = (
  params: GetStickerSetParams
) => Promise<TelegramStickerSet>;
