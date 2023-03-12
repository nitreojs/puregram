import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { Location } from './location'

export class ChatLocation implements Structure {
  constructor (public payload: Interfaces.TelegramChatLocation) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** The location to which the supergroup is connected. Can't be a live location. */
  get location () {
    return new Location(this.payload.location)
  }

  /** Location address; `1-64` characters, as defined by the chat owner */
  get address () {
    return this.payload.address
  }

  toJSON (): Interfaces.TelegramChatLocation {
    return {
      address: this.address,
      location: this.location.toJSON()
    }
  }
}

inspectable(ChatLocation, {
  serialize (struct) {
    return {
      location: struct.location,
      address: struct.address
    }
  }
})
