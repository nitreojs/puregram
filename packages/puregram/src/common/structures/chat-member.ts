import { Inspect, inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { Structure } from '../../types/interfaces'

import { User } from './user'

export class ChatMember implements Structure {
  constructor (public payload: Interfaces.TelegramChatMember) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Information about the user */
  get user () {
    return new User(this.payload.user)
  }

  /** The member's status in the chat */
  get status () {
    return this.payload.status
  }

  /** Owner and administrators only. Custom title for this user */
  get customTitle () {
    return this.payload.custom_title
  }

  /** Owner and administrators only. `true`, if the user's presence in the chat is hidden */
  isAnonymous () {
    return this.payload.is_anonymous
  }

  /**
   * Restricted and kicked only.
   * Date when restrictions will be lifted for this user;
   * unix time
   */
  get untilDate () {
    return this.payload.until_date
  }

  /**
   * Administrators only.
   * `true`, if the bot is allowed to edit administrator privileges of that
   * user
   */
  canBeEdited () {
    return this.payload.can_be_edited
  }

  /**
   * Administrators only.
   * `true`, if the administrator can access the chat event log, chat statistics,
   * message statistics in channels, see channel members, see anonymous administrators
   * in supergroups and ignore slow mode.
   * Implied by any other administrator privilege
   */
  canManageChat () {
    return this.payload.can_manage_chat
  }

  /**
   * Administrators only.
   * `true`, if the administrator can post in the channel;
   * channels only
   */
  canPostMessages () {
    return this.payload.can_post_messages
  }

  /**
   * Administrators only.
   * `true`, if the administrator can edit messages of other users
   * and can pin messages; channels only
   */
  canEditMessages () {
    return this.payload.can_edit_messages
  }

  /**
   * Administrators only.
   * `true`, if the administrator can delete messages of other users
   */
  canDeleteMessages () {
    return this.payload.can_delete_messages
  }

  /**
   * Administrators only.
   * `true`, if the administrator can manage video chats
   */
  canManageVideoChats () {
    return this.payload.can_manage_video_chats
  }

  /**
   * Administrators only.
   * `true`, if the administrator can restrict, ban or unban chat members
   */
  canRestrictMembers () {
    return this.payload.can_restrict_members
  }

  /**
   * Administrators only.
   * `true`, if the administrator can add new administrators with a subset o
   * their own privileges or demote administrators that he has promoted,
   * directly or indirectly (promoted by administrators that were appointed by
   * the user)
   */
  canPromoteMembers () {
    return this.payload.can_promote_members
  }

  /**
   * Administrators and restricted only.
   * `true`, if the user is allowed to change the chat title,
   * photo and other settings
   */
  canChangeInfo () {
    return this.payload.can_change_info
  }

  /**
   * Administrators and restricted only.
   * `true`, if the user is allowed to invite new users to the chat
   */
  canInviteUsers () {
    return this.payload.can_invite_users
  }

  /**
   * Administrators and restricted only.
   * `true`, if the user is allowed to pin messages;
   * groups and supergroups only
   */
  canPinMessages () {
    return this.payload.can_pin_messages
  }

  /** `true`, if the user is allowed to create, rename, close, and reopen forum topics; supergroups only */
  canManageTopics () {
    return this.payload.can_manage_topics
  }

  /**
   * Restricted only.
   * `true`, if the user is a member of the chat at the moment of the request
   */
  isMember () {
    return this.payload.is_member
  }

  /**
   * Restricted only.
   * `true`, if the user is allowed to send text messages,
   * contacts, locations and venues
   */
  canSendMessages () {
    return this.payload.can_send_messages
  }

  /** `true`, if the user is allowed to send audios */
  canSendAudios () {
    return this.payload.can_send_audios
  }

  /** `true`, if the user is allowed to send documents */
  canSendDocuments () {
    return this.payload.can_send_documents
  }

  /** `true`, if the user is allowed to send photos */
  canSendPhotos () {
    return this.payload.can_send_photos
  }

  /** `true`, if the user is allowed to send videos */
  canSendVideos () {
    return this.payload.can_send_videos
  }

  /** `true`, if the user is allowed to send video notes */
  canSendVideoNotes () {
    return this.payload.can_send_video_notes
  }

  /** `true`, if the user is allowed to send voice notes */
  canSendVoiceNotes () {
    return this.payload.can_send_voice_notes
  }

  /** Restricted only. `true`, if the user is allowed to send polls */
  canSendPolls () {
    return this.payload.can_send_polls
  }

  /**
   * Restricted only.
   * `true`, if the user is allowed to send animations, games,
   * stickers and use inline bots
   */
  canSendOtherMessages () {
    return this.payload.can_send_other_messages
  }

  /**
   * Restricted only
   * `true`, if the user is allowed to add web page previews to their messages
   */
  canAddWebPagePreviews () {
    return this.payload.can_add_web_page_previews
  }

  toJSON (): Interfaces.TelegramChatMember {
    // @ts-expect-error typescript yells at status for no reason :smh:
    return {
      status: this.status,
      user: this.user.toJSON(),
      is_anonymous: this.isAnonymous(),
      custom_title: this.customTitle,
      until_date: this.untilDate,
      can_be_edited: this.canBeEdited(),
      can_manage_chat: this.canManageChat(),
      can_post_messages: this.canPostMessages(),
      can_edit_messages: this.canEditMessages(),
      can_delete_messages: this.canDeleteMessages(),
      can_manage_video_chats: this.canManageVideoChats(),
      can_restrict_members: this.canRestrictMembers(),
      can_promote_members: this.canPromoteMembers(),
      can_change_info: this.canChangeInfo(),
      can_invite_users: this.canInviteUsers(),
      can_pin_messages: this.canPinMessages(),
      can_manage_topics: this.canManageTopics(),
      is_member: this.isMember(),
      can_send_messages: this.canSendMessages(),
      can_send_audios: this.canSendAudios(),
      can_send_documents: this.canSendDocuments(),
      can_send_photos: this.canSendPhotos(),
      can_send_videos: this.canSendVideos(),
      can_send_video_notes: this.canSendVideoNotes(),
      can_send_voice_notes: this.canSendVoiceNotes(),
      can_send_other_messages: this.canSendOtherMessages(),
      can_add_web_page_previews: this.canAddWebPagePreviews()
    }
  }
}

inspectable(ChatMember, {
  serialize (struct) {
    const payload = {
      user: struct.user,
      status: struct.status,
      customTitle: struct.customTitle,
      isAnonymous: struct.isAnonymous(),
      untilDate: struct.untilDate,
      canBeEdited: struct.canBeEdited(),
      canManageChat: struct.canManageChat(),
      canPostMessages: struct.canPostMessages(),
      canEditMessages: struct.canEditMessages(),
      canDeleteMessages: struct.canDeleteMessages(),
      canManageVideoChats: struct.canManageVideoChats(),
      canRestrictMembers: struct.canRestrictMembers(),
      canPromoteMembers: struct.canPromoteMembers(),
      canChangeInfo: struct.canChangeInfo(),
      canInviteUsers: struct.canInviteUsers(),
      canPinMessages: struct.canPinMessages(),
      canManageTopics: struct.canManageTopics(),
      isMember: struct.isMember(),
      canSendMessages: struct.canSendMessages(),
      canSendAudios: struct.canSendAudios(),
      canSendDocuments: struct.canSendDocuments(),
      canSendPhotos: struct.canSendPhotos(),
      canSendVideos: struct.canSendVideos(),
      canSendVideoNotes: struct.canSendVideoNotes(),
      canSendVoiceNotes: struct.canSendVoiceNotes(),
      canSendOtherMessages: struct.canSendOtherMessages(),
      canAddWebPagePreviews: struct.canAddWebPagePreviews()
    }

    return filterPayload(payload)
  }
})
