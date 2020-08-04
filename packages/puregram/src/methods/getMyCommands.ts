import { TelegramBotCommand } from '../interfaces';

/**
 * Use this method to get the current list of the bot's commands.
 *
 * Returns `Array of BotCommand` on success.
 */
export type getMyCommands = () => Promise<TelegramBotCommand[]>;
