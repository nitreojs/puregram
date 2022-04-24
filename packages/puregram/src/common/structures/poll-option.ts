import { inspectable } from 'inspectable'

import { TelegramPollOption } from '../../telegram-interfaces'

/** This object contains information about one answer option in a poll. */
export class PollOption {
  constructor(private payload: TelegramPollOption) { }

  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /** Option text, 1-100 characters */
  get text(): string {
    return this.payload.text
  }

  /** Number of users that voted for this option */
  get voterCount(): number {
    return this.payload.voter_count
  }
}

inspectable(PollOption, {
  serialize(option: PollOption) {
    return {
      text: option.text,
      voterCount: option.voterCount
    }
  }
})
