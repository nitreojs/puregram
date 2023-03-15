import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { User } from './user'

/** This object represents an answer of a user in a non-anonymous poll. */
@Inspectable()
export class PollAnswer implements Structure {
  constructor (public payload: Interfaces.TelegramPollAnswer) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Unique poll identifier */
  @Inspect()
  get pollId () {
    return this.payload.poll_id
  }

  /** The user, who changed the answer to the poll */
  @Inspect()
  get user () {
    return new User(this.payload.user)
  }

  /** Sender ID */
  @Inspect()
  get senderId () {
    return this.user.id
  }

  /**
   * 0-based identifiers of answer options, chosen by the user.
   * May be empty if the user retracted their vote.
   */
  @Inspect()
  get optionIds () {
    return this.payload.option_ids
  }

  toJSON () {
    return this.payload
  }
}
