import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { Structure } from '../../types/interfaces'

import { User } from './user'

/**
 * This object represents one special entity in a text message.
 * For example, hashtags, usernames, URLs, etc.
 */
export class MessageEntity implements Structure {
  constructor (public payload: Interfaces.TelegramMessageEntity) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /**
   * Type of the entity.
   *
   * Can be `mention` (`@username`), `hashtag` (`#hashtag`), `cashtag`
   * (`$USD`), `bot_command` (`/start@jobs_bot`), `url`
   * (`https://telegram.org`), `email` (`do-not-reply@telegram.org`),
   * `phone_number` (`+1-212-555-0123`), `bold` (**bold text**), `italic`
   * (_italic text_), `underline` (underlined text), `strikethrough`
   * (~~strikethrough text~~), “spoiler” (spoiler message), `code` (`monowidth string`),
   * `pre` (`monowidth block`), `text_link` (for clickable text URLs), `text_mention`
   * (for users without usernames)
   */
  get type () {
    return this.payload.type
  }

  /** Offset in UTF-16 code units to the start of the entity */
  get offset () {
    return this.payload.offset
  }

  /** Length of the entity in UTF-16 code units */
  get length () {
    return this.payload.length
  }

  /**
   * For `text_link` only, url that will be opened after user taps on the text
   */
  get url () {
    return this.payload.url
  }

  /** For `text_mention` only, the mentioned user */
  get user () {
    const { user } = this.payload

    if (!user) {
      return
    }

    return new User(user)
  }

  /** For `pre` only, the programming language of the entity text */
  get language () {
    return this.payload.language
  }

  /** For `custom_emoji` only, unique identifier of the custom emoji.
   *
   * Use `getCustomEmojiStickers` to get full information about the sticker */
  get customEmojiId () {
    return this.payload.custom_emoji_id
  }

  toJSON (): Interfaces.TelegramMessageEntity {
    return {
      type: this.type,
      offset: this.offset,
      length: this.length,
      url: this.url,
      user: this.user?.toJSON(),
      language: this.language,
      custom_emoji_id: this.customEmojiId
    }
  }
}

inspectable(MessageEntity, {
  serialize (struct) {
    const payload = {
      type: struct.type,
      offset: struct.offset,
      length: struct.length,
      url: struct.url,
      user: struct.user,
      language: struct.language,
      customEmojiId: struct.customEmojiId
    }

    return filterPayload(payload)
  }
})
