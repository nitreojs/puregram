import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { User } from './user'

/** Represents an invite link for a chat. */
@Inspectable()
export class ChatInviteLink implements Structure {
  constructor (public payload: Interfaces.TelegramChatInviteLink) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /**
   * The invite link. If the link was created by another chat administrator,
   * then the second part of the link will be replaced with `…`.
   */
  @Inspect()
  get link () {
    return this.payload.invite_link
  }

  /** Creator of the link */
  @Inspect()
  get creator () {
    return new User(this.payload.creator)
  }

  /** Invite link name */
  @Inspect({ nullable: false })
  get name () {
    return this.payload.name
  }

  /** `true`, if the link is primary */
  @Inspect()
  isPrimary () {
    return this.payload.is_primary
  }

  /** `true`, if the link is revoked */
  @Inspect()
  isRevoked () {
    return this.payload.is_revoked
  }

  /** Point in time (Unix timestamp) when the link will expire or has been expired */
  @Inspect({ nullable: false })
  get expireDate () {
    return this.payload.expire_date
  }

  /**
   * Maximum number of users that can be members of the chat simultaneously
   * after joining the chat via this invite link;
   * `1-99999`
   */
  @Inspect({ nullable: false })
  get memberLimit () {
    return this.payload.member_limit
  }

  /** `true`, if users joining the chat via the link need to be approved by chat administrators */
  @Inspect()
  get createsJoinRequest () {
    return this.payload.creates_join_request
  }

  /** Number of pending join requests created using this link */
  @Inspect({ nullable: false })
  get pendingJoinRequestCount () {
    return this.payload.pending_join_request_count
  }

  toJSON () {
    return this.payload
  }
}
