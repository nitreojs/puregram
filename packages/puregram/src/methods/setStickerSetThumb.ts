import { TelegramInputFile } from '../types';

export interface SetStickerSetThumbParams {
  /** Sticker set name */
  name: string;

  /** User identifier of the sticker set owner */
  user_id: number;

  /**
   * A PNG image with the thumbnail, must be up to 128 kilobytes in size
   * and have width and height exactly 100px, or a TGS animation with the
   * thumbnail up to 32 kilobytes in size;
   * Pass a `file_id` as a String to send a file that already exists on the
   * Telegram servers, pass an **HTTP URL** as a String for Telegram to get
   * a file from the Internet, or upload a new one using `multipart/form-data`.
   * Animated sticker set thumbnail can't be uploaded via HTTP URL.
   */
  thumb?: TelegramInputFile;

  [key: string]: any;
}

/**
 * Use this method to set the thumbnail of a sticker set.
 * Animated thumbnails can be set for animated sticker sets only.
 *
 * Returns `true` on success.
 */
export type setStickerSetThumb = (
  params: SetStickerSetThumbParams
) => Promise<true>;
