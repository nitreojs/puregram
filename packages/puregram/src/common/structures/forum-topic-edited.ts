import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { filterPayload } from '../../utils/helpers'

/** This object represents a service message about an edited forum topic. */
export class ForumTopicEdited implements Structure {
  constructor (public payload: Interfaces.TelegramForumTopicEdited) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** New name of the topic, if it was edited */
  get name () {
    return this.payload.name
  }

  /** New identifier of the custom emoji shown as the topic icon, if it was edited; an empty string if the icon was removed */
  get iconCustomEmojiId () {
    return this.payload.icon_custom_emoji_id
  }

  toJSON (): Interfaces.TelegramForumTopicEdited {
    return {
      name: this.name,
      icon_custom_emoji_id: this.iconCustomEmojiId
    }
  }
}

inspectable(ForumTopicEdited, {
  serialize (struct) {
    const payload = {
      name: struct.name,
      iconCustomEmojiId: struct.iconCustomEmojiId
    }

    return filterPayload(payload)
  }
})
