import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { Structure } from '../../types/interfaces'

import { Message } from './message'
import { User } from './user'

/**
 * This object represents an incoming callback query from a callback button in
 * an inline keyboard. If the button that originated the query was attached to
 * a message sent by the bot, the field message will be present.
 * If the button was attached to a message sent via the bot (in inline mode),
 * the field inline_message_id will be present.
 * Exactly one of the fields `data` or `game_short_name` will be present.
 */
export class CallbackQuery implements Structure {
  constructor (public payload: Interfaces.TelegramCallbackQuery) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Unique identifier for this query */
  get id () {
    return this.payload.id
  }

  /** Sender */
  get from () {
    return new User(this.payload.from)
  }

  /** Sender ID */
  get senderId () {
    return this.from.id
  }

  /**
   * Message with the callback button that originated the query.
   * Note that message content and message date will not be available
   * if the message is too old
   */
  get message () {
    const { message } = this.payload

    if (!message) {
      return
    }

    return new Message(message)
  }

  /**
   * Identifier of the message sent via the bot in inline mode,
   * that originated the query.
   */
  get inlineMessageId () {
    return this.payload.inline_message_id
  }

  /**
   * Global identifier, uniquely corresponding to the chat to which the message
   * with the callback button was sent. Useful for high scores in games.
   */
  get chatInstance () {
    return this.payload.chat_instance
  }

  /**
   * Data associated with the callback button.
   * Be aware that a bad client can send arbitrary data in this field.
   */
  get data () {
    return this.payload.data
  }

  /**
   * Short name of a Game to be returned,
   * serves as the unique identifier for the game
   */
  get gameShortName () {
    return this.payload.game_short_name
  }

  toJSON (): Interfaces.TelegramCallbackQuery {
    return {
      id: this.id,
      from: this.from.toJSON(),
      message: this.message?.toJSON(),
      inline_message_id: this.inlineMessageId,
      chat_instance: this.chatInstance,
      data: this.data,
      game_short_name: this.gameShortName
    }
  }
}

inspectable(CallbackQuery, {
  serialize (struct) {
    const payload = {
      id: struct.id,
      from: struct.from,
      message: struct.message,
      inlineMessageId: struct.inlineMessageId,
      chatInstance: struct.chatInstance,
      data: struct.data,
      gameShortName: struct.gameShortName
    }

    return filterPayload(payload)
  }
})
