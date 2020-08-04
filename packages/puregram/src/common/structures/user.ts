import { inspectable } from 'inspectable';

import { TelegramUser } from '../../interfaces';
import { filterPayload } from '../../utils/helpers';

/** This object represents a Telegram user or bot. */
export class User {
  private payload: TelegramUser;

  constructor(payload: TelegramUser) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** Unique identifier for this user or bot */
  public get id(): number {
    return this.payload.id;
  }

  /** `true`, if this user is a bot */
  public get isBot(): boolean {
    return this.payload.is_bot;
  }

  /** User's or bot's first name */
  public get firstName(): string {
    return this.payload.first_name;
  }

  /** User's or bot's last name */
  public get lastName(): string | undefined {
    return this.payload.last_name;
  }

  /** User's or bot's username */
  public get username(): string | undefined {
    return this.payload.username;
  }

  /**
   * [IETF language tag](https://en.wikipedia.org/wiki/IETF_language_tag)
   * of the user's language
   */
  public get languageCode(): string | undefined {
    return this.payload.language_code;
  }

  /**
   * `true`, if the bot can be invited to groups.
   *
   * Returned only in `getMe`.
   */
  public get canJoinGroups(): boolean | undefined {
    return this.payload.can_join_groups;
  }

  /**
   * `true`, if privacy mode is disabled for the bot.
   *
   * Returned only in `getMe`.
   */
  public get canReadAllGroupMessages(): boolean | undefined {
    return this.payload.can_read_all_group_messages;
  }

  /**
   * `true`, if the bot supports inline queries.
   *
   * Returned only in `getMe`.
   */
  public get supportsInlineQueries(): boolean | undefined {
    return this.payload.supports_inline_queries;
  }
}

inspectable(User, {
  serialize(user: User) {
    const payload = {
      id: user.id,
      isBot: user.isBot,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      languageCode: user.languageCode,
      canJoinGroups: user.canJoinGroups,
      canReadAllGroupMessages: user.canReadAllGroupMessages,
      supportsInlineQueries: user.supportsInlineQueries
    };

    return filterPayload(payload);
  }
});
