import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object represents a service message about a video chat ended in the chat. */
export class VideoChatEnded implements Structure {
  constructor (public payload: Interfaces.TelegramVideoChatEnded) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Video chat duration; in seconds */
  get duration () {
    return this.payload.duration
  }

  toJSON (): Interfaces.TelegramVideoChatEnded {
    return {
      duration: this.duration
    }
  }
}

inspectable(VideoChatEnded, {
  serialize (struct) {
    return {
      duration: struct.duration
    }
  }
})
