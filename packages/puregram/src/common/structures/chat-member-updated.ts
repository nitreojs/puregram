import { inspectable } from 'inspectable'

import { TelegramChatMemberUpdated } from '../../telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { Chat } from './chat'
import { ChatInviteLink } from './chat-invite-link'
import { ChatMember } from './chat-member'
import { User } from './user'

/** This object represents changes in the status of a chat member. */
export class ChatMemberUpdated {
  constructor(public payload: TelegramChatMemberUpdated) { }

  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /** Chat the user belongs to */
  get chat(): Chat {
    return new Chat(this.payload.chat)
  }

  /** Performer of the action, which resulted in the change */
  get from(): User {
    return new User(this.payload.from)
  }

  /** Date the change was done in Unix time */
  get date(): number {
    return this.payload.date
  }

  /** Previous information about the chat member */
  get oldChatMember(): ChatMember {
    return new ChatMember(this.payload.old_chat_member)
  }

  /** New information about the chat member */
  get newChatMember(): ChatMember {
    return new ChatMember(this.payload.new_chat_member)
  }

  /**
   * Chat invite link, which was used by the user to join the chat;
   * for joining by invite link events only.
   */
  get inviteLink(): ChatInviteLink | undefined {
    const { invite_link } = this.payload

    if (!invite_link) {
      return
    }

    return new ChatInviteLink(invite_link)
  }
}

inspectable(ChatMemberUpdated, {
  serialize(member: ChatMemberUpdated) {
    const payload = {
      chat: member.chat,
      from: member.from,
      date: member.date,
      oldChatMember: member.oldChatMember,
      newChatMember: member.newChatMember,
      inviteLink: member.inviteLink
    }

    return filterPayload(payload)
  }
})
