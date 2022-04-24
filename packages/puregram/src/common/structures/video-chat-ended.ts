import { inspectable } from 'inspectable'

import { TelegramVideoChatEnded } from '../../telegram-interfaces'

/** This object represents a service message about a video chat ended in the chat. */
export class VideoChatEnded {
  constructor(public payload: TelegramVideoChatEnded) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** Video chat duration; in seconds */
  get duration() {
    return this.payload.duration
  }
}

inspectable(VideoChatEnded, {
  serialize(event: VideoChatEnded) {
    return {
      duration: event.duration
    }
  }
})
