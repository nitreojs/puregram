import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { filterPayload } from '../../utils/helpers'

/** Represents the rights of an administrator in a chat. */
export class ChatAdministratorRights {
  constructor(private payload: Interfaces.TelegramChatAdministratorRights) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /** `true`, if the user's presence in the chat is hidden */
  get isAnonymous() {
    return this.payload.is_anonymous
  }

  /** `true`, if the administrator can access the chat event log, chat statistics, message statistics in channels, see channel members, see anonymous administrators in supergroups and ignore slow mode. Implied by any other administrator privilege */
  get canManageChat() {
    return this.payload.can_manage_chat
  }

  /** `true`, if the administrator can delete messages of other users */
  get canDeleteMessages() {
    return this.payload.can_delete_messages
  }

  /** `true`, if the administrator can manage video chats */
  get canManageVideoChats() {
    return this.payload.can_manage_video_chats
  }

  /** `true`, if the administrator can restrict, ban or unban chat members */
  get canRestrictMembers() {
    return this.payload.can_restrict_members
  }

  /** `true`, if the administrator can add new administrators with a subset of their own privileges or demote administrators that he has promoted, directly or indirectly (promoted by administrators that were appointed by the user) */
  get canPromoteMembers() {
    return this.payload.can_promote_members
  }

  /** `true`, if the user is allowed to change the chat title, photo and other settings */
  get canChangeInfo() {
    return this.payload.can_change_info
  }

  /** `true`, if the user is allowed to invite new users to the chat */
  get canInviteUsers() {
    return this.payload.can_invite_users
  }

  /** `true`, if the administrator can post in the channel; channels only */
  get canPostMessages() {
    return this.payload.can_post_messages
  }

  /** `true`, if the administrator can edit messages of other users and can pin messages; channels only */
  get canEditMessages() {
    return this.payload.can_edit_messages
  }

  /** `true`, if the user is allowed to pin messages; groups and supergroups only */
  get canPinMessages() {
    return this.payload.can_pin_messages
  }
}

inspectable(ChatAdministratorRights, {
  serialize(struct) {
    const payload = {
      isAnonymous: struct.isAnonymous,
      canManageChat: struct.canManageChat,
      canDeleteMessages: struct.canDeleteMessages,
      canManageVideoChats: struct.canManageVideoChats,
      canRestrictMembers: struct.canRestrictMembers,
      canPromoteMembers: struct.canPromoteMembers,
      canChangeInfo: struct.canChangeInfo,
      canInviteUsers: struct.canInviteUsers,
      canPostMessages: struct.canPostMessages,
      canEditMessages: struct.canEditMessages,
      canPinMessages: struct.canPinMessages
    }

    return filterPayload(payload)
  }
})
