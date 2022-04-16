import { inspectable } from 'inspectable'

import { TelegramVideoChatScheduled } from '../../telegram-interfaces'

/**
 * This object represents a service message about a video chat scheduled in the chat
 */
export class VideoChatScheduled {
  public payload: TelegramVideoChatScheduled

  constructor(options: TelegramVideoChatScheduled) {
    this.payload = options
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  public get startDate(): number {
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
