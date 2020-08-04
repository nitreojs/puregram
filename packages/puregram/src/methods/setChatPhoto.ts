import { TelegramInputFile } from '../types';

export interface SetChatPhotoParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /** New chat photo, uploaded using `multipart/form-data` */
  photo: TelegramInputFile;
}

/**
 * Use this method to set a new profile photo for the chat
 * Photos can't be changed for private chats.
 * The bot must be an administrator in the chat for this to work and
 * must have the appropriate admin rights.
 *
 * Returns `true` on success.
 */
export type setChatPhoto = (params: SetChatPhotoParams) => Promise<true>;
