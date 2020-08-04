import { TelegramInputFile } from '../types';
import { TelegramMaskPosition } from '../interfaces';

export interface CreateNewStickerSetParams {
  /** User identifier of created sticker set owner */
  user_id: number;

  /**
   * Short name of sticker set, to be used in `t.me/addstickers/` URLs
   * (e.g., `animals`). Can contain only english letters, digits and
   * underscores. Must begin with a letter, can't contain consecutive
   * underscores and must end in `_by_<bot username>`. `<bot_username>`
   * is case insensitive. 1-64 characters.
   */
  name: string;

  /** Sticker set title, 1-64 characters */
  title: string;

  /**
   * PNG image with the sticker, must be up to 512 kilobytes in size,
   * dimensions must not exceed 512px, and either width or height must be
   * exactly 512px.
   * Pass a `file_id` as a String to send a file that already exists on the
   * Telegram servers, pass an **HTTP URL** as a String for Telegram to get
   * a file from the Internet, or upload a new one using `multipart/form-data`
   */
  png_sticker?: TelegramInputFile;

  /** TGS animation with the sticker, uploaded using `multipart/form-data` */
  tgs_sticker?: TelegramInputFile;

  /** One or more emoji corresponding to the sticker */
  emojis: string;

  /** Pass `true`, if a set of mask stickers should be created */
  contains_masks?: boolean;

  /**
   * A JSON-serialized object for position where the mask should be placed
   * on faces
   */
  mask_position?: TelegramMaskPosition;
}

/**
 * Use this method to create a new sticker set owned by a user.
 * The bot will be able to edit the sticker set thus created.
 * You must use exactly one of the fields `png_sticker` or `tgs_sticker`.
 *
 * Returns `true` on success.
 */
export type createNewStickerSet = (
  params: CreateNewStickerSetParams
) => Promise<true>;
