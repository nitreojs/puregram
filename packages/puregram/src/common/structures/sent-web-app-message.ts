import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

/** Contains information about an inline message sent by a Web App on behalf of a user. */
export class SentWebAppMessage {
  constructor(private payload: Interfaces.TelegramSentWebAppMessage) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /**
   * Identifier of the sent inline message.
   * 
   * Available only if there is an inline keyboard attached to the message.
   */
  get inlineMessageId() {
    return this.payload.inline_message_id
  }
}

inspectable(SentWebAppMessage, {
  serialize(struct) {
    const payload = {
      inlineMessageId: struct.inlineMessageId
    }

    return filterPayload(payload)
  }
})
