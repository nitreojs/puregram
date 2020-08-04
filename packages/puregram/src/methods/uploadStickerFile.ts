import { TelegramFile } from '../interfaces';
import { TelegramInputFile } from '../types';

export interface UploadStickerFileParams {
  /** User identifier of sticker file owner */
  user_id: number;

  /**
   * **PNG** image with the sticker, must be up to 512 kilobytes in size,
   * dimensions must not exceed 512px, and either width or height must
   * be exactly 512px.
   */
  png_sticker: TelegramInputFile;
}

/**
 * Use this method to upload a .PNG file with a sticker for later use
 * in `createNewStickerSet` and `addStickerToSet` methods
 * (can be used multiple times).
 *
 * Returns the uploaded `File` on success.
 */
export type uploadStickerFile = (
  params: UploadStickerFileParams
) => Promise<TelegramFile>;
