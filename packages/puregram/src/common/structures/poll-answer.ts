import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { User } from './user'

/** This object represents an answer of a user in a non-anonymous poll. */
export class PollAnswer {
  constructor(public payload: Interfaces.TelegramPollAnswer) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** Unique poll identifier */
  get pollId() {
    return this.payload.poll_id
  }

  /** The user, who changed the answer to the poll */
  get user() {
    return new User(this.payload.user)
  }

  /** Sender ID */
  get senderId() {
    return this.user.id
  }

  /**
   * 0-based identifiers of answer options, chosen by the user.
   * May be empty if the user retracted their vote.
   */
  get optionIds() {
    return this.payload.option_ids
  }
}

inspectable(PollAnswer, {
  serialize(struct) {
    return {
      pollId: struct.pollId,
      user: struct.user,
      senderId: struct.senderId,
      optionIds: struct.optionIds
    }
  }
})
