import { TelegramUser } from '../interfaces';

/** A simple method for testing your bot's auth token */
export type getMe = () => Promise<TelegramUser>;
