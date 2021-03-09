import { inspectable } from 'inspectable';

import { TelegramChatMemberUpdated } from '../../interfaces';
import { filterPayload } from '../../utils/helpers';

import { Chat } from './chat';
import { ChatInviteLink } from './chat-invite-link';
import { ChatMember } from './chat-member';
import { User } from './user';

/** This object represents changes in the status of a chat member. */
export class ChatMemberUpdated {
  private options: TelegramChatMemberUpdated;

  constructor(options: TelegramChatMemberUpdated) {
    this.options = options;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** Chat the user belongs to */
  public get chat(): Chat {
    return new Chat(this.options.chat);
  }

  /** Performer of the action, which resulted in the change */
  public get from(): User {
    return new User(this.options.from);
  }

  /** Date the change was done in Unix time */
  public get date(): number {
    return this.options.date;
  }

  /** Previous information about the chat member */
  public get oldChatMember(): ChatMember {
    return new ChatMember(this.options.old_chat_member);
  }

  /** New information about the chat member */
  public get newChatMember(): ChatMember {
    return new ChatMember(this.options.new_chat_member);
  }

  /**
   * Chat invite link, which was used by the user to join the chat;
   * for joining by invite link events only.
   */
  public get inviteLink(): ChatInviteLink | undefined {
    const { invite_link } = this.options;

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
      inviteLinnk: member.inviteLink
    };

    return filterPayload(payload);
  }
});
