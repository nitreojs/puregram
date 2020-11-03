import { TelegramWebhookInfo } from '../interfaces';

/**
 * Use this method to get current webhook status.
 *
 * On success, returns a `WebhookInfo` object.
 * If the bot is using `getUpdates`,
 * will return an object with the `url` field empty.
 */
export type getWebhookInfo = () => Promise<TelegramWebhookInfo>;
