import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/** This object contains information about one answer option in a poll. */
export class PollOption implements Structure {
  constructor (public payload: Interfaces.TelegramPollOption) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Option text, 1-100 characters */
  get text () {
    return this.payload.text
  }

  /** Number of users that voted for this option */
  get voterCount () {
    return this.payload.voter_count
  }

  toJSON (): Interfaces.TelegramPollOption {
    return {
      text: this.text,
      voter_count: this.voterCount
    }
  }
}

inspectable(PollOption, {
  serialize (struct) {
    return {
      text: struct.text,
      voterCount: struct.voterCount
    }
  }
})
