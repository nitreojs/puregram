import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { Chat } from './chat'
import { ChatInviteLink } from './chat-invite-link'
import { ChatMember } from './chat-member'
import { User } from './user'

/** This object represents changes in the status of a chat member. */
@Inspectable()
export class ChatMemberUpdated implements Structure {
  constructor (public payload: Interfaces.TelegramChatMemberUpdated) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Chat the user belongs to */
  @Inspect()
  get chat () {
    return new Chat(this.payload.chat)
  }

  /** Performer of the action, which resulted in the change */
  @Inspect()
  get from () {
    return new User(this.payload.from)
  }

  /** Date the change was done in Unix time */
  @Inspect()
  get date () {
    return this.payload.date
  }

  /** Previous information about the chat member */
  @Inspect()
  get oldChatMember () {
    return new ChatMember(this.payload.old_chat_member)
  }

  /** New information about the chat member */
  @Inspect()
  get newChatMember () {
    return new ChatMember(this.payload.new_chat_member)
  }

  /**
   * Chat invite link, which was used by the user to join the chat;
   * for joining by invite link events only.
   */
  @Inspect({ nullable: false })
  get inviteLink () {
    const { invite_link } = this.payload

    if (!invite_link) {
      return
    }

    return new ChatInviteLink(invite_link)
  }

  toJSON () {
    return this.payload
  }
}
