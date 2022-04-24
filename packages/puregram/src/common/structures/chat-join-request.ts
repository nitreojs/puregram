import { inspectable } from 'inspectable'

import { TelegramChatJoinRequest } from '../../telegram-interfaces'

import { Chat } from './chat'
import { User } from './user'
import { ChatInviteLink } from './chat-invite-link'

export class ChatJoinRequest {
  constructor(public payload: TelegramChatJoinRequest) { }

  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /** Chat to which the request was sent */
  get chat(): Chat {
    return new Chat(this.payload.chat)
  }

  /** User that sent the join request */
  get from(): User {
    return new User(this.payload.from)
  }

  /** Date the request was sent in Unix time */
  get date(): number {
    return this.payload.date
  }

  /** Bio of the user */
  get bio(): string | undefined {
    return this.payload.bio
  }

  /** Chat invite link that was used by the user to send the join request */
  get inviteLink(): ChatInviteLink | undefined {
    const { invite_link } = this.payload

    if (!invite_link) {
      return
    }

    return new ChatInviteLink(invite_link)
  }
}

inspectable(ChatJoinRequest, {
  serialize(request: ChatJoinRequest) {
    return {
      chat: request.chat,
      from: request.from,
      date: request.date,
      bio: request.bio,
      inviteLink: request.inviteLink
    }
  }
})
