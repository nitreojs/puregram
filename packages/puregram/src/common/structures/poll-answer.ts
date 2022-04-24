import { inspectable } from 'inspectable'

import { TelegramPollAnswer } from '../../telegram-interfaces'

import { User } from './user'

/** This object represents an answer of a user in a non-anonymous poll. */
export class PollAnswer {
  constructor(public payload: TelegramPollAnswer) { }

  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /** Unique poll identifier */
  get pollId(): string {
    return this.payload.poll_id
  }

  /** The user, who changed the answer to the poll */
  get user(): User {
    return new User(this.payload.user)
  }

  /** Sender ID */
  get senderId(): number {
    return this.user.id
  }

  /**
   * 0-based identifiers of answer options, chosen by the user.
   * May be empty if the user retracted their vote.
   */
  get optionIds(): number[] {
    return this.payload.option_ids
  }
}

inspectable(PollAnswer, {
  serialize(answer: PollAnswer) {
    return {
      pollId: answer.pollId,
      user: answer.user,
      senderId: answer.senderId,
      optionIds: answer.optionIds
    }
  }
})
