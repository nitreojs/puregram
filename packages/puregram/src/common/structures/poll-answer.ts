import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { User } from './user'
import { Chat } from './chat'
import { memoizeGetters } from '../../utils/helpers'

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

  /** The chat that changed the answer to the poll, if the voter is anonymous */
  @Inspect({ nullable: false })
  get voterChat () {
    const { voter_chat } = this.payload

    if (!voter_chat) {
      return
    }

    return new Chat(voter_chat)
  }

  /** The user, who changed the answer to the poll */
  @Inspect({ nullable: false })
  get user () {
    const { user } = this.payload

    if (!user) {
      return
    }

    return new User(user)
  }

  /** Sender ID. Since `user` and `voterChat` are mutually exclusive, this field will either contain `user.id` or `voterChat.id` as a shortcut =) */
  @Inspect()
  get senderId () {
    return this.user?.id ?? this.voterChat?.id as number
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

memoizeGetters(PollAnswer, ['voterChat', 'user'])
