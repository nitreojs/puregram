import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { User } from './user'
import { Location } from './location'

/**
 * This object represents an incoming inline query.
 * When the user sends an empty query, your bot could return some default or
 * trending results.
 */
@Inspectable()
export class InlineQuery implements Structure {
  constructor (public payload: Interfaces.TelegramInlineQuery) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Unique identifier for this query */
  @Inspect()
  get id () {
    return this.payload.id
  }

  /** Sender */
  @Inspect()
  get from () {
    return new User(this.payload.from)
  }

  /** Sender location, only for bots that request user location */
  @Inspect({ nullable: false })
  get location () {
    const { location } = this.payload

    if (!location) {
      return
    }

    return new Location(location)
  }

  /** Text of the query (up to 256 characters) */
  @Inspect()
  get query () {
    return this.payload.query
  }

  /** Offset of the results to be returned, can be controlled by the bot */
  @Inspect()
  get offset () {
    return this.payload.offset
  }

  toJSON () {
    return this.payload
  }
}
