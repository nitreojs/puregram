import { inspectable } from 'inspectable';

import { TelegramChatInviteLink } from '../../interfaces';
import { filterPayload } from '../../utils/helpers';

import { User } from './user';

/** Represents an invite link for a chat. */
export class ChatInviteLink {
  private options: TelegramChatInviteLink;

  constructor(options: TelegramChatInviteLink) {
    this.options = options;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /**
   * The invite link. If the link was created by another chat administrator,
   * then the second part of the link will be replaced with `…`.
   */
  public get link(): string {
    return this.options.invite_link;
  }

  /** Creator of the link */
  public get creator(): User {
    return new User(this.options.creator);
  }

  /** `true`, if the link is primary */
  public get isPrimary(): boolean {
    return this.options.is_primary;
  }

  /** `true`, if the link is revoked */
  public get isRevoked(): boolean {
    return this.options.is_revoked;
  }

  /** Point in time (Unix timestamp) when the link will expire or has been expired */
  public get expireDate(): number | undefined {
    return this.options.expire_date;
  }

  /**
   * Maximum number of users that can be members of the chat simultaneously
   * after joining the chat via this invite link;
   * `1-99999`
   */
  public get memberLimit(): number | undefined {
    return this.options.member_limit;
  }
}

inspectable(ChatInviteLink, {
  serialize(link: ChatInviteLink) {
    const payload = {
      link: link.link,
      creator: link.creator,
      isPrimary: link.isPrimary,
      isRevoked: link.isRevoked,
      expireDate: link.expireDate,
      memberLimit: link.memberLimit
    };

    return filterPayload(payload);
  }
});
