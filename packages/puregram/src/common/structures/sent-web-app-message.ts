import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { Structure } from '../../types/interfaces'

/** Contains information about an inline message sent by a Web App on behalf of a user. */
export class SentWebAppMessage implements Structure {
  constructor (private payload: Interfaces.TelegramSentWebAppMessage) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /**
   * Identifier of the sent inline message.
   *
   * Available only if there is an inline keyboard attached to the message.
   */
  get inlineMessageId () {
    return this.payload.inline_message_id
  }

  toJSON (): Interfaces.TelegramSentWebAppMessage {
    return {
      inline_message_id: this.inlineMessageId
    }
  }
}

inspectable(SentWebAppMessage, {
  serialize (struct) {
    const payload = {
      inlineMessageId: struct.inlineMessageId
    }

    return filterPayload(payload)
  }
})
