import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

/** This object contains information about one answer option in a poll. */
export class PollOption {
  constructor(private payload: Interfaces.TelegramPollOption) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** Option text, 1-100 characters */
  get text() {
    return this.payload.text
  }

  /** Number of users that voted for this option */
  get voterCount() {
    return this.payload.voter_count
  }
}

inspectable(PollOption, {
  serialize(struct) {
    return {
      text: struct.text,
      voterCount: struct.voterCount
    }
  }
})
