import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { filterPayload } from '../../utils/helpers'

/** This object represents a service message about a new forum topic created in the chat. */
export class ForumTopicCreated implements Structure {
  constructor (public payload: Interfaces.TelegramForumTopicCreated) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Name of the topic */
  get name () {
    return this.payload.name
  }

  /** Color of the topic icon in RGB format */
  get iconColor () {
    return this.payload.icon_color
  }

  /** Unique identifier of the custom emoji shown as the topic icon */
  get iconCustomEmojiId () {
    return this.payload.icon_custom_emoji_id
  }

  toJSON (): Interfaces.TelegramForumTopicCreated {
    return {
      name: this.name,
      icon_color: this.iconColor,
      icon_custom_emoji_id: this.iconCustomEmojiId
    }
  }
}

inspectable(ForumTopicCreated, {
  serialize (struct) {
    const payload = {
      name: struct.name,
      iconColor: struct.iconColor,
      iconCustomEmojiId: struct.iconCustomEmojiId
    }

    return filterPayload(payload)
  }
})
