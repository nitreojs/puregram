import { inspectable } from 'inspectable'

import { TelegramInlineQuery } from '../generated/telegram-interfaces'
import { User } from '../common/structures/user'
import { Location } from '../common/structures/location'
import { filterPayload } from '../utils/helpers'

/**
 * This object represents an incoming inline query.
 * When the user sends an empty query, your bot could return some default or
 * trending results.
 */
export class InlineQuery {
  constructor(public payload: TelegramInlineQuery) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** Unique identifier for this query */
  get id() {
    return this.payload.id
  }

  /** Sender */
  get from() {
    return new User(this.payload.from)
  }

  /** Sender location, only for bots that request user location */
  get location() {
    const { location } = this.payload

    if (!location) {
      return
    }

    return new Location(location)
  }

  /** Text of the query (up to 256 characters) */
  get query() {
    return this.payload.query
  }

  /** Offset of the results to be returned, can be controlled by the bot */
  get offset() {
    return this.payload.offset
  }
}

inspectable(InlineQuery, {
  serialize(query) {
    const payload = {
      id: query.id,
      from: query.from,
      location: query.location,
      query: query.query,
      offset: query.offset
    }

    return filterPayload(payload)
  }
})
