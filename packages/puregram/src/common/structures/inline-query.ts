import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { Structure } from '../../types/interfaces'

import { User } from './user'
import { Location } from './location'

/**
 * This object represents an incoming inline query.
 * When the user sends an empty query, your bot could return some default or
 * trending results.
 */
export class InlineQuery implements Structure {
  constructor (public payload: Interfaces.TelegramInlineQuery) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Unique identifier for this query */
  get id () {
    return this.payload.id
  }

  /** Sender */
  get from () {
    return new User(this.payload.from)
  }

  /** Sender location, only for bots that request user location */
  get location () {
    const { location } = this.payload

    if (!location) {
      return
    }

    return new Location(location)
  }

  /** Text of the query (up to 256 characters) */
  get query () {
    return this.payload.query
  }

  /** Offset of the results to be returned, can be controlled by the bot */
  get offset () {
    return this.payload.offset
  }

  toJSON (): Interfaces.TelegramInlineQuery {
    return {
      id: this.id,
      from: this.from.toJSON(),
      location: this.location?.toJSON(),
      query: this.query,
      offset: this.offset
    }
  }
}

inspectable(InlineQuery, {
  serialize (struct) {
    const payload = {
      id: struct.id,
      from: struct.from,
      location: struct.location,
      query: struct.query,
      offset: struct.offset
    }

    return filterPayload(payload)
  }
})
