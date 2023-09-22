import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { User } from './user'

/**
 * This object contains information about one member of a chat. Currently, the following 6 types of chat members are supported:
 * - `ChatMemberOwner`
 * - `ChatMemberAdministrator`
 * - `ChatMemberMember`
 * - `ChatMemberRestricted`
 * - `ChatMemberLeft`
 * - `ChatMemberBanned`
 */
@Inspectable()
export class ChatMember implements Structure {
  constructor (public payload: Interfaces.TelegramChatMember) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Information about the user */
  @Inspect()
  get user () {
    return new User(this.payload.user)
  }

  /** The member's status in the chat */
  @Inspect()
  get status () {
    return this.payload.status
  }

  /** Owner and administrators only. Custom title for this user */
  @Inspect({ nullable: false })
  get customTitle (): string | undefined {
    return this.payload.custom_title
  }

  /** Owner and administrators only. `true`, if the user's presence in the chat is hidden */
  @Inspect({ compute: true, nullable: false })
  isAnonymous (): boolean | undefined {
    return this.payload.is_anonymous
  }

  /**
   * Restricted and kicked only.
   * Date when restrictions will be lifted for this user;
   * unix time
   */
  @Inspect({ nullable: false })
  get untilDate (): number | undefined {
    return this.payload.until_date
  }

  /**
   * Administrators only.
   * `true`, if the bot is allowed to edit administrator privileges of that
   * user
   */
  @Inspect({ compute: true, nullable: false })
  canBeEdited (): boolean | undefined {
    return this.payload.can_be_edited
  }

  /**
   * Administrators only.
   * `true`, if the administrator can access the chat event log, chat statistics,
   * message statistics in channels, see channel members, see anonymous administrators
   * in supergroups and ignore slow mode.
   * Implied by any other administrator privilege
   */
  @Inspect({ compute: true, nullable: false })
  canManageChat (): boolean | undefined {
    return this.payload.can_manage_chat
  }

  /**
   * Administrators only.
   * `true`, if the administrator can post in the channel;
   * channels only
   */
  @Inspect({ compute: true, nullable: false })
  canPostMessages (): boolean | undefined {
    return this.payload.can_post_messages
  }

  /**
   * Administrators only.
   * `true`, if the administrator can edit messages of other users
   * and can pin messages; channels only
   */
  @Inspect({ compute: true, nullable: false })
  canEditMessages (): boolean | undefined {
    return this.payload.can_edit_messages
  }

  /**
   * Administrators only.
   * `true`, if the administrator can delete messages of other users
   */
  @Inspect({ compute: true, nullable: false })
  canDeleteMessages (): boolean | undefined {
    return this.payload.can_delete_messages
  }

  /**
   * Administrators only.
   * `true`, if the administrator can manage video chats
   */
  @Inspect({ compute: true, nullable: false })
  canManageVideoChats (): boolean | undefined {
    return this.payload.can_manage_video_chats
  }

  /**
   * Administrators only.
   * `true`, if the administrator can restrict, ban or unban chat members
   */
  @Inspect({ compute: true, nullable: false })
  canRestrictMembers (): boolean | undefined {
    return this.payload.can_restrict_members
  }

  /**
   * Administrators only.
   * `true`, if the administrator can add new administrators with a subset o
   * their own privileges or demote administrators that he has promoted,
   * directly or indirectly (promoted by administrators that were appointed by
   * the user)
   */
  @Inspect({ compute: true, nullable: false })
  canPromoteMembers (): boolean | undefined {
    return this.payload.can_promote_members
  }

  /**
   * Administrators and restricted only.
   * `true`, if the user is allowed to change the chat title,
   * photo and other settings
   */
  @Inspect({ compute: true, nullable: false })
  canChangeInfo (): boolean | undefined {
    return this.payload.can_change_info
  }

  /**
   * Administrators and restricted only.
   * `true`, if the user is allowed to invite new users to the chat
   */
  @Inspect({ compute: true, nullable: false })
  canInviteUsers (): boolean | undefined {
    return this.payload.can_invite_users
  }

  /**
   * Administrators and restricted only.
   * `true`, if the user is allowed to pin messages;
   * groups and supergroups only
   */
  @Inspect({ compute: true, nullable: false })
  canPinMessages (): boolean | undefined {
    return this.payload.can_pin_messages
  }

  /** `true`, if the administrator can post stories in the channel; channels only */
  @Inspect({ compute: true })
  canPostStories () {
    return this.payload.can_post_stories
  }

  /** `true`, if the administrator can edit stories posted by other users; channels only */
  @Inspect({ compute: true })
  canEditStories () {
    return this.payload.can_edit_stories
  }

  /** `true`, if the administrator can delete stories posted by other users; channels only */
  @Inspect({ compute: true })
  canDeleteStories () {
    return this.payload.can_delete_stories
  }

  /** `true`, if the user is allowed to create, rename, close, and reopen forum topics; supergroups only */
  @Inspect({ compute: true, nullable: false })
  canManageTopics (): boolean | undefined {
    return this.payload.can_manage_topics
  }

  /**
   * Restricted only.
   * `true`, if the user is a member of the chat at the moment of the request
   */
  @Inspect({ compute: true, nullable: false })
  isMember (): boolean | undefined {
    return this.payload.is_member
  }

  /**
   * Restricted only.
   * `true`, if the user is allowed to send text messages,
   * contacts, locations and venues
   */
  @Inspect({ compute: true, nullable: false })
  canSendMessages (): boolean | undefined {
    return this.payload.can_send_messages
  }

  /** `true`, if the user is allowed to send audios */
  @Inspect({ compute: true, nullable: false })
  canSendAudios (): boolean | undefined {
    return this.payload.can_send_audios
  }

  /** `true`, if the user is allowed to send documents */
  @Inspect({ compute: true, nullable: false })
  canSendDocuments (): boolean | undefined {
    return this.payload.can_send_documents
  }

  /** `true`, if the user is allowed to send photos */
  @Inspect({ compute: true, nullable: false })
  canSendPhotos (): boolean | undefined {
    return this.payload.can_send_photos
  }

  /** `true`, if the user is allowed to send videos */
  @Inspect({ compute: true, nullable: false })
  canSendVideos (): boolean | undefined {
    return this.payload.can_send_videos
  }

  /** `true`, if the user is allowed to send video notes */
  @Inspect({ compute: true, nullable: false })
  canSendVideoNotes (): boolean | undefined {
    return this.payload.can_send_video_notes
  }

  /** `true`, if the user is allowed to send voice notes */
  @Inspect({ compute: true, nullable: false })
  canSendVoiceNotes (): boolean | undefined {
    return this.payload.can_send_voice_notes
  }

  /** Restricted only. `true`, if the user is allowed to send polls */
  canSendPolls (): boolean | undefined {
    return this.payload.can_send_polls
  }

  /**
   * Restricted only.
   * `true`, if the user is allowed to send animations, games,
   * stickers and use inline bots
   */
  @Inspect({ compute: true, nullable: false })
  canSendOtherMessages (): boolean | undefined {
    return this.payload.can_send_other_messages
  }

  /**
   * Restricted only
   * `true`, if the user is allowed to add web page previews to their messages
   */
  @Inspect({ compute: true, nullable: false })
  canAddWebPagePreviews (): boolean | undefined {
    return this.payload.can_add_web_page_previews
  }

  toJSON () {
    return this.payload
  }
}
