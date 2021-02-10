import { ChatAction } from '../types';

export interface SendChatActionParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Type of action to broadcast.
   * Choose one, depending on what the user is about to receive:
   *
   * * `typing` for text messages,
   *
   * * `upload_photo` for photos,
   *
   * * `record_video` or `upload_video` for videos
   *
   * * `record_audio` or `upload_audio` for audio files,
   *
   * * `upload_document` for general files,
   *
   * * `find_location` for location data,
   *
   * * `record_video_note` or `upload_video_note` for video notes.
   */
  action: ChatAction;

  [key: string]: any;
}

/**
 * Use this method when you need to tell the user that something is happening
 * on the bot's side. The status is set for 5 seconds or less
 * (when a message arrives from your bot, Telegram clients clear its
 * typing status).
 *
 * Returns `true` on success.
 */
export type sendChatAction = (params: SendChatActionParams) => Promise<true>;
