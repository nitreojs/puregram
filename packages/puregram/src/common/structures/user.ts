import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { Structure } from '../../types/interfaces'

/** This object represents a Telegram user or bot. */
export class User implements Structure {
  constructor (public payload: Interfaces.TelegramUser) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Unique identifier for this user or bot */
  get id () {
    return Number(this.payload.id)
  }

  /** `true`, if this user is a bot */
  isBot () {
    return this.payload.is_bot
  }

  /** User's or bot's first name */
  get firstName () {
    return this.payload.first_name
  }

  /** User's or bot's last name */
  get lastName () {
    return this.payload.last_name
  }

  /** User's or bot's username */
  get username () {
    return this.payload.username
  }

  /**
   * [IETF language tag](https://en.wikipedia.org/wiki/IETF_language_tag)
   * of the user's language
   */
  get languageCode () {
    return this.payload.language_code
  }

  /** `true`, if this user is a Telegram Premium user */
  isPremium () {
    return this.payload.is_premium as true | undefined
  }

  /** `true`, if this user added the bot to the attachment menu */
  get addedToAttachmentMenu () {
    return this.payload.added_to_attachment_menu as true | undefined
  }

  /**
   * `true`, if the bot can be invited to groups.
   *
   * Returned only in `getMe`.
   */
  canJoinGroups () {
    return this.payload.can_join_groups
  }

  /**
   * `true`, if privacy mode is disabled for the bot.
   *
   * Returned only in `getMe`.
   */
  canReadAllGroupMessages () {
    return this.payload.can_read_all_group_messages
  }

  /**
   * `true`, if the bot supports inline queries.
   *
   * Returned only in `getMe`.
   */
  get supportsInlineQueries () {
    return this.payload.supports_inline_queries
  }

  toJSON () {
    return this.payload
  }
}

inspectable(User, {
  serialize (struct) {
    const payload = {
      id: struct.id,
      isBot: struct.isBot(),
      firstName: struct.firstName,
      lastName: struct.lastName,
      username: struct.username,
      languageCode: struct.languageCode,
      isPremium: struct.isPremium(),
      addedToAttachmentMenu: struct.addedToAttachmentMenu,
      canJoinGroups: struct.canJoinGroups(),
      canReadAllGroupMessages: struct.canReadAllGroupMessages(),
      supportsInlineQueries: struct.supportsInlineQueries
    }

    return filterPayload(payload)
  }
})
