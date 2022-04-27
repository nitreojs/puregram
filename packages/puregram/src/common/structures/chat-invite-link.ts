import { inspectable } from 'inspectable'

import { TelegramChatInviteLink } from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { User } from './user'

/** Represents an invite link for a chat. */
export class ChatInviteLink {
  constructor(public payload: TelegramChatInviteLink) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /**
   * The invite link. If the link was created by another chat administrator,
   * then the second part of the link will be replaced with `…`.
   */
  get link() {
    return this.payload.invite_link
  }

  /** Creator of the link */
  get creator() {
    return new User(this.payload.creator)
  }

  /** Invite link name */
  get name() {
    return this.payload.name
  }

  /** `true`, if the link is primary */
  get isPrimary() {
    return this.payload.is_primary
  }

  /** `true`, if the link is revoked */
  get isRevoked() {
    return this.payload.is_revoked
  }

  /** Point in time (Unix timestamp) when the link will expire or has been expired */
  get expireDate() {
    return this.payload.expire_date
  }

  /**
   * Maximum number of users that can be members of the chat simultaneously
   * after joining the chat via this invite link;
   * `1-99999`
   */
  get memberLimit() {
    return this.payload.member_limit
  }

  /** `true`, if users joining the chat via the link need to be approved by chat administrators */
  get createsJoinRequest() {
    return this.payload.creates_join_request
  }

  /** Number of pending join requests created using this link */
  get pendingJoinRequestCount() {
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
