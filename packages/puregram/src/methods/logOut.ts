/**
 * Use this method to log out from the cloud Bot API server before launching the bot locally.
 * You must log out the bot before running it locally,
 * otherwise there is no guarantee that the bot will receive updates.
 * After a successful call
 * you will not be able to log in again using the same token for 10 minutes.
 *
 * Returns `true` on success.
 */
export type logOut = () => Promise<true>;
