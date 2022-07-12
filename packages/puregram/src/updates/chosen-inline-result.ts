import { inspectable } from 'inspectable'

import { TelegramChosenInlineResult } from '../generated/telegram-interfaces'
import { User } from '../common/structures/user'
import { Location } from '../common/structures/location'
import { filterPayload } from '../utils/helpers'

export class ChosenInlineResult {
  constructor (public payload: TelegramChosenInlineResult) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** The unique identifier for the result that was chosen */
  get resultId () {
    return this.payload.result_id
  }

  /** The user that chose the result */
  get from () {
    return new User(this.payload.from)
  }

  /** Sender ID */
  get senderId () {
    return this.from.id
  }

  /** Sender location, only for bots that require user location */
  get location () {
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
  get inlineMessageId () {
    return this.payload.inline_message_id
  }

  /** The query that was used to obtain the result */
  get query () {
    return this.payload.query
  }
}

inspectable(ChosenInlineResult, {
  serialize (update) {
    const payload = {
      resultId: update.resultId,
      from: update.from,
      senderId: update.senderId,
      location: update.location,
      inlineMessageId: update.inlineMessageId,
      query: update.query
    }

    return filterPayload(payload)
  }
})
