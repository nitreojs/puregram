import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents a service message about a new forum topic created in the chat. */
@Inspectable()
export class ForumTopicCreated implements Structure {
  constructor (public payload: Interfaces.TelegramForumTopicCreated) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Name of the topic */
  @Inspect()
  get name () {
    return this.payload.name
  }

  /** Color of the topic icon in RGB format */
  @Inspect()
  get iconColor () {
    return this.payload.icon_color
  }

  /** Unique identifier of the custom emoji shown as the topic icon */
  @Inspect({ nullable: false })
  get iconCustomEmojiId () {
    return this.payload.icon_custom_emoji_id
  }

  toJSON () {
    return this.payload
  }
}
