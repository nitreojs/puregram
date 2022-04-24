import { inspectable } from 'inspectable'

import { TelegramUser } from '../../telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

/** This object represents a Telegram user or bot. */
export class User {
  constructor(private payload: TelegramUser) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** Unique identifier for this user or bot */
  get id() {
    return Number(this.payload.id)
  }

  /** `true`, if this user is a bot */
  get isBot() {
    return this.payload.is_bot
  }

  /** User's or bot's first name */
  get firstName() {
    return this.payload.first_name
  }

  /** User's or bot's last name */
  get lastName() {
    return this.payload.last_name
  }

  /** User's or bot's username */
  get username() {
    return this.payload.username
  }

  /**
   * [IETF language tag](https://en.wikipedia.org/wiki/IETF_language_tag)
   * of the user's language
   */
  get languageCode() {
    return this.payload.language_code
  }

  /**
   * `true`, if the bot can be invited to groups.
   *
   * Returned only in `getMe`.
   */
  get canJoinGroups() {
    return this.payload.can_join_groups
  }

  /**
   * `true`, if privacy mode is disabled for the bot.
   *
   * Returned only in `getMe`.
   */
  get canReadAllGroupMessages() {
    return this.payload.can_read_all_group_messages
  }

  /**
   * `true`, if the bot supports inline queries.
   *
   * Returned only in `getMe`.
   */
  get supportsInlineQueries() {
    return this.payload.supports_inline_queries
  }

  toJSON(): TelegramUser {
    return {
      id: this.id,
      is_bot: this.isBot,
      first_name: this.firstName,
      last_name: this.lastName,
      username: this.username,
      language_code: this.languageCode,
      can_join_groups: this.canJoinGroups,
      can_read_all_group_messages: this.canReadAllGroupMessages,
      supports_inline_queries: this.supportsInlineQueries
    }
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
    }

    return filterPayload(payload)
  }
})
