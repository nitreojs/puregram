import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents a unique message identifier. */
export class MessageId implements Structure {
  constructor (public payload: Interfaces.TelegramMessageId) { }

  /** Unique message identifier */
  get id () {
    return this.payload.message_id
  }

  toJSON (): Interfaces.TelegramMessageId {
    return {
      message_id: this.id
    }
  }
}

inspectable(MessageId, {
  serialize (struct) {
    return {
      id: struct.id
    }
  }
})
