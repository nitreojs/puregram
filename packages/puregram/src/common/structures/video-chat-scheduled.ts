import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/**
 * This object represents a service message about a video chat scheduled in the chat
 */
export class VideoChatScheduled implements Structure {
  constructor (public payload: Interfaces.TelegramVideoChatScheduled) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  get startDate () {
    return this.payload.start_date
  }

  toJSON (): Interfaces.TelegramVideoChatScheduled {
    return {
      start_date: this.startDate
    }
  }
}

inspectable(VideoChatScheduled, {
  serialize (struct) {
    return {
      startDate: struct.startDate
    }
  }
})
