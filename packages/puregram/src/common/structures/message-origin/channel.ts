import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../../generated'

import { Chat } from '../chat'

import { MessageOrigin } from './message-origin'
import { memoizeGetters } from '../../../utils/helpers'

/** The message was originally sent to a channel chat. */
@Inspectable()
export class MessageOriginChannel extends MessageOrigin {
  constructor (public payload: Interfaces.TelegramMessageOriginChannel) {
    super(payload)
  }

  /** Type of the message origin, always `channel` */
  @Inspect()
  get type () {
    return this.payload.type
  }

  /** Date the message was sent originally in Unix time */
  @Inspect()
  get date () {
    return this.payload.date
  }

  /** Channel chat to which the message was originally sent */
  @Inspect()
  get chat () {
    return new Chat(this.payload.chat)
  }

  /** Unique message identifier inside the chat */
  @Inspect()
  get messageId () {
    return this.payload.message_id
  }

  /** Signature of the original post author */
  @Inspect()
  get authorSignature () {
    return this.payload.author_signature
  }
}

memoizeGetters(MessageOriginChannel, ['chat'])
