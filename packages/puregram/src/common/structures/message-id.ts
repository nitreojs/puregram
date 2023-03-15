import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents a unique message identifier. */
@Inspectable()
export class MessageId implements Structure {
  constructor (public payload: Interfaces.TelegramMessageId) { }

  /** Unique message identifier */
  @Inspect()
  get id () {
    return this.payload.message_id
  }

  toJSON () {
    return this.payload
  }
}
