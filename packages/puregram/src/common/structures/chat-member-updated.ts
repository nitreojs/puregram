import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { Chat } from './chat'
import { ChatInviteLink } from './chat-invite-link'
import { ChatMember } from './chat-member'
import { User } from './user'

/** This object represents changes in the status of a chat member. */
export class ChatMemberUpdated {
  constructor (public payload: Interfaces.TelegramChatMemberUpdated) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Chat the user belongs to */
  get chat () {
    return new Chat(this.payload.chat)
  }

  /** Performer of the action, which resulted in the change */
  get from () {
    return new User(this.payload.from)
  }

  /** Date the change was done in Unix time */
  get date () {
    return this.payload.date
  }

  /** Previous information about the chat member */
  get oldChatMember () {
    return new ChatMember(this.payload.old_chat_member)
  }

  /** New information about the chat member */
  get newChatMember () {
    return new ChatMember(this.payload.new_chat_member)
  }

  /**
   * Chat invite link, which was used by the user to join the chat;
   * for joining by invite link events only.
   */
  get inviteLink () {
    const { invite_link } = this.payload

    if (!invite_link) {
      return
    }

    return new ChatInviteLink(invite_link)
  }
}

inspectable(ChatMemberUpdated, {
  serialize (struct) {
    const payload = {
      chat: struct.chat,
      from: struct.from,
      date: struct.date,
      oldChatMember: struct.oldChatMember,
      newChatMember: struct.newChatMember,
      inviteLink: struct.inviteLink
    }

    return filterPayload(payload)
  }
})
