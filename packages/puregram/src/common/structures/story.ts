import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

@Inspectable()
export class Story implements Structure {
  constructor (public payload: Interfaces.TelegramStory) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Unique identifier for the story in the chat */
  @Inspect()
  get id () {
    return this.payload.id
  }

  /** Chat that posted the story */
  @Inspect()
  get chat () {
    return this.payload.chat
  }

  toJSON () {
    return this.payload
  }
}
