import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

/** This object represents a service message about a video chat ended in the chat. */
export class VideoChatEnded {
  constructor (public payload: Interfaces.TelegramVideoChatEnded) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Video chat duration; in seconds */
  get duration () {
    return this.payload.duration
  }
}

inspectable(VideoChatEnded, {
  serialize (struct) {
    return {
      duration: struct.duration
    }
  }
})
