import { inspectable } from 'inspectable'

import { TelegramInlineQuery } from '../telegram-interfaces'
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

  public get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /** Unique identifier for this query */
  public get id(): string {
    return this.payload.id
  }

  /** Sender */
  public get from(): User {
    return new User(this.payload.from)
  }

  /** Sender location, only for bots that request user location */
  public get location(): Location | undefined {
    const { location } = this.payload

    if (!location) return undefined

    return new Location(location)
  }

  /** Text of the query (up to 256 characters) */
  public get query(): string {
    return this.payload.query
  }

  /** Offset of the results to be returned, can be controlled by the bot */
  public get offset(): string {
    return this.payload.offset
  }
}

inspectable(InlineQuery, {
  serialize(query: InlineQuery) {
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
