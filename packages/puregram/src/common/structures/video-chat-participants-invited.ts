import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { User } from './user'

/** This object represents a service message about new members invited to a video chat. */
export class VideoChatParticipantsInvited implements Structure {
  constructor (public payload: Interfaces.TelegramVideoChatParticipantsInvited) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** New members that were invited to the video chat */
  get users () {
    return this.payload.users.map(user => new User(user))
  }

  toJSON (): Interfaces.TelegramVideoChatParticipantsInvited {
    return {
      users: this.users.map(user => user.toJSON())
    }
  }
}

inspectable(VideoChatParticipantsInvited, {
  serialize (struct) {
    return {
      users: struct.users
    }
  }
})
