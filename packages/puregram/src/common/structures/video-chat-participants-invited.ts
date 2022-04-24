import { inspectable } from 'inspectable'

import { TelegramVideoChatParticipantsInvited } from '../../telegram-interfaces'

import { User } from './user'

/** This object represents a service message about new members invited to a video chat. */
export class VideoChatParticipantsInvited {
  constructor(public payload: TelegramVideoChatParticipantsInvited) { }

  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /** New members that were invited to the video chat */
  get users(): User[] {
    return (this.payload.users ?? []).map(
      (payload) => new User(payload)
    )
  }
}

inspectable(VideoChatParticipantsInvited, {
  serialize(event: VideoChatParticipantsInvited) {
    return {}
  }
})
