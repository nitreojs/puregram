import { Inspect, Inspectable } from 'inspectable'
import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'
import { Chat } from './chat'
import { ReactionType } from './reaction-type/reaction-type'
import { ReactionTypeCustomEmoji, ReactionTypeEmoji } from './reaction-type'

/** This object represents reaction changes on a message with anonymous reactions. */
@Inspectable()
export class MessageReactionCountUpdated implements Structure {
  constructor (public payload: Interfaces.TelegramMessageReactionCountUpdated) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** The chat containing the message the user reacted to */
  @Inspect()
  get chat () {
    return new Chat(this.payload.chat)
  }

  /** Unique identifier of the message inside the chat */
  @Inspect()
  get messageId () {
    return this.payload.message_id
  }

  /** Date of the change in Unix time */
  @Inspect()
  get date () {
    return this.payload.date
  }

  /** List of reactions that are present on the message */
  @Inspect()
  get reactions () {
    const reactions: ReactionType[] = []

    for (const reaction of this.payload.reactions) {
      if (reaction.type.type === 'emoji') {
        reactions.push(new ReactionTypeEmoji(reaction.type))
      } else if (reaction.type.type === 'custom_emoji') {
        reactions.push(new ReactionTypeCustomEmoji(reaction.type))
      } else {
        throw new TypeError('unknown reaction type')
      }
    }

    return reactions
  }

  toJSON () {
    return this.payload
  }
}
