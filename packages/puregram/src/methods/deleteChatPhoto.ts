export interface DeleteChatPhotoParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id?: number | string;

  [key: string]: any;
}

/**
 * Use this method to delete a chat photo.
 * Photos can't be changed for private chats.
 * The bot must be an administrator in the chat for this to work and
 * must have the appropriate admin rights.
 *
 * Returns `true` on success.
 */
export type deleteChatPhoto = (params: DeleteChatPhotoParams) => Promise<true>;
