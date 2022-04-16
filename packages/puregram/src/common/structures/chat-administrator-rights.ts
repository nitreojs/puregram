import { inspectable } from 'inspectable'

import { TelegramChatAdministratorRights } from '../../telegram-interfaces'

/** Represents the rights of an administrator in a chat. */
export class ChatAdministratorRights {
  private payload: TelegramChatAdministratorRights

  constructor(payload: TelegramChatAdministratorRights) {
    this.payload = payload
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /** `true`, if the user's presence in the chat is hidden */
  public get isAnonymous(): boolean {
    return this.payload.is_anonymous
  }

  /** `true`, if the administrator can access the chat event log, chat statistics, message statistics in channels, see channel members, see anonymous administrators in supergroups and ignore slow mode. Implied by any other administrator privilege */
  public get canManageChat(): boolean {
    return this.payload.can_manage_chat
  }

  /** `true`, if the administrator can delete messages of other users */
  public get canDeleteMessages(): boolean {
    return this.payload.can_delete_messages
  }

  /** `true`, if the administrator can manage video chats */
  public get canManageVideoChats(): boolean {
    return this.payload.can_manage_video_chats
  }

  /** `true`, if the administrator can restrict, ban or unban chat members */
  public get canRestrictMembers(): boolean {
    return this.payload.can_restrict_members
  }

  /** `true`, if the administrator can add new administrators with a subset of their own privileges or demote administrators that he has promoted, directly or indirectly (promoted by administrators that were appointed by the user) */
  public get canPromoteMembers(): boolean {
    return this.payload.can_promote_members
  }

  /** `true`, if the user is allowed to change the chat title, photo and other settings */
  public get canChangeInfo(): boolean {
    return this.payload.can_change_info
  }

  /** `true`, if the user is allowed to invite new users to the chat */
  public get canInviteUsers(): boolean {
    return this.payload.can_invite_users
  }

  /** `true`, if the administrator can post in the channel; channels only */
  public get canPostMessages(): boolean | undefined {
    return this.payload.can_post_messages
  }

  /** `true`, if the administrator can edit messages of other users and can pin messages; channels only */
  public get canEditMessages(): boolean | undefined {
    return this.payload.can_edit_messages
  }

  /** `true`, if the user is allowed to pin messages; groups and supergroups only */
  public get canPinMessages(): boolean | undefined {
    return this.payload.can_pin_messages
  }
}

inspectable(ChatAdministratorRights, {
  serialize(rights: ChatAdministratorRights) {

  }
})
