import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Chat } from './chat'
import { User } from './user'
import { ChatInviteLink } from './chat-invite-link'

export class ChatJoinRequest {
  constructor(public payload: Interfaces.TelegramChatJoinRequest) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** Chat to which the request was sent */
  get chat() {
    return new Chat(this.payload.chat)
  }

  /** User that sent the join request */
  get from() {
    return new User(this.payload.from)
  }

  /** Date the request was sent in Unix time */
  get date() {
    return this.payload.date
  }

  /** Bio of the user */
  get bio() {
    return this.payload.bio
  }

  /** Chat invite link that was used by the user to send the join request */
  get inviteLink() {
    const { invite_link } = this.payload

    if (!invite_link) {
      return
    }

    return new ChatInviteLink(invite_link)
  }
}

inspectable(ChatJoinRequest, {
  serialize(request) {
    return {
      chat: request.chat,
      from: request.from,
      date: request.date,
      bio: request.bio,
      inviteLink: request.inviteLink
    }
  }
})
