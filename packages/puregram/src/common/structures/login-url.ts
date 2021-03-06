import { inspectable } from 'inspectable';

import { TelegramLoginUrl } from '../../telegram-interfaces';
import { filterPayload } from '../../utils/helpers';

/**
 * This object represents a parameter of the inline keyboard button used to
 * automatically authorize a user.
 */
export class LoginUrl {
  private payload: TelegramLoginUrl;

  constructor(payload: TelegramLoginUrl) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /**
   * An HTTP URL to be opened with user authorization data added to the query
   * string when the button is pressed. If the user refuses to provid
   * authorization data, the original URL without information about the user
   * will be opened. The data added is the same as described in Receiving
   * authorization data.
   *
   * **NOTE**: You **must** always check the hash of the received data to
   * verify the authentication and the integrity of the data as described in
   * Checking authorization.
   */
  public get url(): string {
    return this.payload.url;
  }

  /** New text of the button in forwarded messages. */
  public get forwardText(): string | undefined {
    return this.payload.forward_text;
  }

  /**
   * Username of a bot, which will be used for user authorization.
   * See Setting up a bot for more details. If not specified, the current
   * bot's username will be assumed. The url's domain must be the same as the
   * domain linked with the bot. See Linking your domain to the bot for more
   * details.
   */
  public get botUsername(): string | undefined {
    return this.payload.bot_username;
  }

  /**
   * Pass `true` to request the permission for your bot to send messages to the
   * user.
   */
  public get requestWriteAccess(): boolean | undefined {
    return this.payload.request_write_access;
  }
}

inspectable(LoginUrl, {
  serialize(loginUrl: LoginUrl) {
    const payload = {
      url: loginUrl.url,
      forwardText: loginUrl.forwardText,
      botUsername: loginUrl.botUsername,
      requestWriteAccess: loginUrl.requestWriteAccess
    };

    return filterPayload(payload);
  }
});
