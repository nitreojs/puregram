import {
  TelegramInlineKeyboardMarkup,
  TelegramMessage
} from '../interfaces';

export interface SendGameParams {
  /**
   * Unique identifier for the target chat
   */
  chat_id: number;

  /**
   * Short name of the game, serves as the unique identifier for the game.
   * Set up your games via Botfather.
   */
  game_short_name: string;

  /**
   * Sends the message silently. Users will receive a notification with no sound.
   */
  disable_notification?: boolean;

  /**
   * If the message is a reply, ID of the original message
   */
  reply_to_message_id?: number;

  /**
   * A JSON-serialized object for an inline keyboard.
   * If empty, one 'Play game_title' button will be shown.
   * If not empty, the first button must launch the game.
   */
  reply_markup?: TelegramInlineKeyboardMarkup;
}

/**
 * Use this method to send a game. On success, the sent Message is returned.
 */
export type sendGame = (params: SendGameParams) => Promise<TelegramMessage>;
