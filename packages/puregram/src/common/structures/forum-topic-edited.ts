import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents a service message about an edited forum topic. */
@Inspectable()
export class ForumTopicEdited implements Structure {
  constructor (public payload: Interfaces.TelegramForumTopicEdited) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** New name of the topic, if it was edited */
  @Inspect()
  get name () {
    return this.payload.name
  }

  /** New identifier of the custom emoji shown as the topic icon, if it was edited; an empty string if the icon was removed */
  @Inspect({ nullable: false })
  get iconCustomEmojiId () {
    return this.payload.icon_custom_emoji_id
  }

  toJSON () {
    return this.payload
  }
}
