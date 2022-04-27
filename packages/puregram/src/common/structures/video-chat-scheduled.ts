import { inspectable } from 'inspectable'

import { TelegramVideoChatScheduled } from '../../generated/telegram-interfaces'

/**
 * This object represents a service message about a video chat scheduled in the chat
 */
export class VideoChatScheduled {
  constructor(public payload: TelegramVideoChatScheduled) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  get startDate() {
    return this.payload.start_date
  }
}

inspectable(VideoChatScheduled, {
  serialize(event: VideoChatScheduled) {
    return {
      startDate: event.startDate
    }
  }
})
