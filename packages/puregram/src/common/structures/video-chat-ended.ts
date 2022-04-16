import { inspectable } from 'inspectable'

import { TelegramVideoChatEnded } from '../../telegram-interfaces'

/** This object represents a service message about a video chat ended in the chat. */
export class VideoChatEnded {
  constructor(public payload: TelegramVideoChatEnded) { }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /** Video chat duration; in seconds */
  public get duration(): number {
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
