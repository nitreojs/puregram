import { inspectable } from 'inspectable'

import { TelegramChosenInlineResult } from '../telegram-interfaces'
import { User } from '../common/structures/user'
import { Location } from '../common/structures/location'
import { filterPayload } from '../utils/helpers'

export class ChosenInlineResult {
  constructor(public payload: TelegramChosenInlineResult) { }

  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /** The unique identifier for the result that was chosen */
  get resultId(): string {
    return this.payload.result_id
  }

  /** The user that chose the result */
  get from(): User {
    return new User(this.payload.from)
  }

  /** Sender ID */
  get senderId(): number {
    return this.from.id
  }

  /** Sender location, only for bots that require user location */
  get location(): Location | undefined {
    const { location } = this.payload

    if (!location) {
      return
    }

    return new Location(location)
  }

  /**
   * Identifier of the sent inline message. Available only if there is an
   * inline keyboard attached to the message. Will be also received in callback
   * queries and can be used to edit the message.
   */
  get inlineMessageId(): string | undefined {
    return this.payload.inline_message_id
  }

  /** The query that was used to obtain the result */
  get query(): string {
    return this.payload.query
  }
}

inspectable(ChosenInlineResult, {
  serialize(inlineResult: ChosenInlineResult) {
    const payload = {
      resultId: inlineResult.resultId,
      from: inlineResult.from,
      senderId: inlineResult.senderId,
      location: inlineResult.location,
      inlineMessageId: inlineResult.inlineMessageId,
      query: inlineResult.query
    }

    return filterPayload(payload)
  }
})
