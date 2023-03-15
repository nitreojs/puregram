import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents a service message about a video chat ended in the chat. */
@Inspectable()
export class VideoChatEnded implements Structure {
  constructor (public payload: Interfaces.TelegramVideoChatEnded) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Video chat duration; in seconds */
  @Inspect()
  get duration () {
    return this.payload.duration
  }

  toJSON () {
    return this.payload
  }
}
