import { TelegramBotCommand } from '../interfaces';

export interface setMyCommandsParams {
  /**
   * A JSON-serialized list of bot commands to be set as the list of the
   * bot's commands. At most `100` commands can be specified.
   */
  commands: TelegramBotCommand[];

  [key: string]: any;
}

/**
 * Use this method to change the list of the bot's commands.
 *
 * Returns `true` on success.
 */
export type setMyCommands = (params: setMyCommandsParams) => Promise<true>;
