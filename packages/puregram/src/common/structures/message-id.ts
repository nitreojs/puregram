import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

/** This object represents a unique message identifier. */
export class MessageId {
  constructor(private payload: Interfaces.TelegramMessageId) { }

  /** Unique message identifier */
  get id() {
    return this.payload.message_id
  }
}

inspectable(MessageId, {
  serialize(struct) {
    return {
      id: struct.id
    }
  }
})
