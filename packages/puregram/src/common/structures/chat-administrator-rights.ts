import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { filterPayload } from '../../utils/helpers'

/** Represents the rights of an administrator in a chat. */
export class ChatAdministratorRights implements Structure {
  constructor (public payload: Interfaces.TelegramChatAdministratorRights) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** `true`, if the user's presence in the chat is hidden */
  isAnonymous () {
    return this.payload.is_anonymous
  }

  /** `true`, if the administrator can access the chat event log, chat statistics, message statistics in channels, see channel members, see anonymous administrators in supergroups and ignore slow mode. Implied by any other administrator privilege */
  canManageChat () {
    return this.payload.can_manage_chat
  }

  /** `true`, if the administrator can delete messages of other users */
  canDeleteMessages () {
    return this.payload.can_delete_messages
  }

  /** `true`, if the administrator can manage video chats */
  canManageVideoChats () {
    return this.payload.can_manage_video_chats
  }

  /** `true`, if the administrator can restrict, ban or unban chat members */
  canRestrictMembers () {
    return this.payload.can_restrict_members
  }

  /** `true`, if the administrator can add new administrators with a subset of their own privileges or demote administrators that he has promoted, directly or indirectly (promoted by administrators that were appointed by the user) */
  canPromoteMembers () {
    return this.payload.can_promote_members
  }

  /** `true`, if the user is allowed to change the chat title, photo and other settings */
  canChangeInfo () {
    return this.payload.can_change_info
  }

  /** `true`, if the user is allowed to invite new users to the chat */
  canInviteUsers () {
    return this.payload.can_invite_users
  }

  /** `true`, if the administrator can post in the channel; channels only */
  canPostMessages () {
    return this.payload.can_post_messages
  }

  /** `true`, if the administrator can edit messages of other users and can pin messages; channels only */
  canEditMessages () {
    return this.payload.can_edit_messages
  }

  /** `true`, if the user is allowed to pin messages; groups and supergroups only */
  canPinMessages () {
    return this.payload.can_pin_messages
  }

  /** `true`, if the user is allowed to create, rename, close, and reopen forum topics; supergroups only */
  canManageTopics () {
    return this.payload.can_manage_topics
  }

  toJSON () {
    return this.payload
  }
}

inspectable(ChatAdministratorRights, {
  serialize (struct) {
    const payload = {
      isAnonymous: struct.isAnonymous(),
      canManageChat: struct.canManageChat(),
      canDeleteMessages: struct.canDeleteMessages(),
      canManageVideoChats: struct.canManageVideoChats(),
      canRestrictMembers: struct.canRestrictMembers(),
      canPromoteMembers: struct.canPromoteMembers(),
      canChangeInfo: struct.canChangeInfo(),
      canInviteUsers: struct.canInviteUsers(),
      canPostMessages: struct.canPostMessages(),
      canEditMessages: struct.canEditMessages(),
      canPinMessages: struct.canPinMessages(),
      canManageTopics: struct.canManageTopics()
    }

    return filterPayload(payload)
  }
})
