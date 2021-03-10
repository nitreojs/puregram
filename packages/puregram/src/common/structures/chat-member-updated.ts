import { inspectable } from 'inspectable';

import { TelegramChatMemberUpdated } from '../../interfaces';
import { filterPayload } from '../../utils/helpers';

import { Chat } from './chat';
import { ChatInviteLink } from './chat-invite-link';
import { ChatMember } from './chat-member';
import { User } from './user';

/** This object represents changes in the status of a chat member. */
export class ChatMemberUpdated {
  public payload: TelegramChatMemberUpdated;

  constructor(options: TelegramChatMemberUpdated) {
    this.payload = options;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** Chat the user belongs to */
  public get chat(): Chat {
    return new Chat(this.payload.chat);
  }

  /** Performer of the action, which resulted in the change */
  public get from(): User {
    return new User(this.payload.from);
  }

  /** Date the change was done in Unix time */
  public get date(): number {
    return this.payload.date;
  }

  /** Previous information about the chat member */
  public get oldChatMember(): ChatMember {
    return new ChatMember(this.payload.old_chat_member);
  }

  /** New information about the chat member */
  public get newChatMember(): ChatMember {
    return new ChatMember(this.payload.new_chat_member);
  }

  /**
   * Chat invite link, which was used by the user to join the chat;
   * for joining by invite link events only.
   */
  public get inviteLink(): ChatInviteLink | undefined {
    const { invite_link } = this.payload;

    if (!invite_link) return;

    return new ChatInviteLink(invite_link);
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
    };

    return filterPayload(payload);
  }
});
