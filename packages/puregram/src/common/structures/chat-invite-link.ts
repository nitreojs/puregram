import { inspectable } from 'inspectable'

import { TelegramChatInviteLink } from '../../telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { User } from './user'

/** Represents an invite link for a chat. */
export class ChatInviteLink {
  constructor(public payload: TelegramChatInviteLink) { }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /**
   * The invite link. If the link was created by another chat administrator,
   * then the second part of the link will be replaced with `…`.
   */
  public get link(): string {
    return this.payload.invite_link
  }

  /** Creator of the link */
  public get creator(): User {
    return new User(this.payload.creator)
  }

  /** Invite link name */
  public get name(): string | undefined {
    return this.payload.name
  }

  /** `true`, if the link is primary */
  public get isPrimary(): boolean {
    return this.payload.is_primary
  }

  /** `true`, if the link is revoked */
  public get isRevoked(): boolean {
    return this.payload.is_revoked
  }

  /** Point in time (Unix timestamp) when the link will expire or has been expired */
  public get expireDate(): number | undefined {
    return this.payload.expire_date
  }

  /**
   * Maximum number of users that can be members of the chat simultaneously
   * after joining the chat via this invite link;
   * `1-99999`
   */
  public get memberLimit(): number | undefined {
    return this.payload.member_limit
  }

  /** `true`, if users joining the chat via the link need to be approved by chat administrators */
  public get createsJoinRequest(): boolean {
    return this.payload.creates_join_request
  }

  /** Number of pending join requests created using this link */
  public get pendingJoinRequestCount(): number | undefined {
    return this.payload.pending_join_request_count
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
      memberLimit: link.memberLimit,
      createsJoinRequest: link.createsJoinRequest,
      pendingJoinRequestCount: link.pendingJoinRequestCount
    }

    return filterPayload(payload)
  }
})
