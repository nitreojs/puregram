import { inspectable } from 'inspectable'

import { TelegramMessageId } from '../../telegram-interfaces'

/** This object represents a unique message identifier. */
export class MessageId {
  constructor(private payload: TelegramMessageId) { }

  /** Unique message identifier */
  get id() {
    return this.payload.message_id
  }
}

inspectable(MessageId, {
  serialize(messageId: MessageId) {
    return {
      id: messageId.id
    }
  }
})
