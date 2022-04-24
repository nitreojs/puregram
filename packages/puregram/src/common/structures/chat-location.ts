import { inspectable } from 'inspectable'

import { TelegramChatLocation } from '../../telegram-interfaces'

import { Location } from './location'

export class ChatLocation {
  constructor(private payload: TelegramChatLocation) { }

  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /** The location to which the supergroup is connected. Can't be a live location. */
  get location(): Location {
    return new Location(this.payload.location)
  }

  /** Location address; `1-64` characters, as defined by the chat owner */
  get address(): string {
    return this.payload.address
  }
}

inspectable(ChatLocation, {
  serialize(chatLocation: ChatLocation) {
    return {
      location: chatLocation.location,
      address: chatLocation.address
    }
  }
})
