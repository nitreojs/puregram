import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { User } from './user'
import { Chat } from './chat'

/** This object represents a forwarded message. */
export class ForwardedMessage {
  constructor (private payload: Interfaces.TelegramMessage) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /**
   * For messages forwarded from channels, identifier of the original message
   * in the channel
   */
  get id () {
    return this.payload.forward_from_message_id
  }

  /** For forwarded messages, sender of the original message */
  get from () {
    const { forward_from } = this.payload

    if (!forward_from) {
      return
    }

    return new User(forward_from)
  }

  /**
   * For messages forwarded from channels, information about the original
   * channel
   */
  get chat () {
    const { forward_from_chat } = this.payload

    if (!forward_from_chat) {
      return
    }

    return new Chat(forward_from_chat)
  }

  /**
   * For messages forwarded from channels, signature of the post author
   * if present
   */
  get signature () {
    return this.payload.forward_signature
  }

  /**
   * Sender's name for messages forwarded from users who disallow adding a link
   * to their account in forwarded messages
   */
  get senderName () {
    return this.payload.forward_sender_name
  }

  /**
   * For forwarded messages, date the original message was sent in Unix time
   */
  get createdAt () {
    return this.payload.forward_date as number
  }

  /** `true`, if the message is a channel post that was automatically forwarded to the connected discussion group */
  isAutomatic () {
    return this.payload.is_automatic_forward
  }
}

inspectable(ForwardedMessage, {
  serialize (struct) {
    const payload = {
      id: struct.id,
      from: struct.from,
      chat: struct.chat,
      signature: struct.signature,
      senderName: struct.senderName,
      createdAt: struct.createdAt,
      isAutomatic: struct.isAutomatic()
    }

    return filterPayload(payload)
  }
})
