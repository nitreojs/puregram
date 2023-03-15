import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

/**
 * Describes actions that a non-administrator user is allowed to take in a
 * chat.
 */
@Inspectable()
export class ChatPermissions implements Structure {
  constructor (public payload: Interfaces.TelegramChatPermissions) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /**
   * `true`, if the user is allowed to send text messages, contacts, locations
   * and venues
   */
  @Inspect({ compute: true, nullable: false })
  canSendMessages (): boolean | undefined {
    return this.payload.can_send_messages
  }

  /**
   * `true`, if the user is allowed to send audios, documents, photos, videos,
   * video notes and voice notes, implies `can_send_messages`
   */
  @Inspect({ compute: true, nullable: false })
  canSendMediaMessages (): boolean | undefined {
    return this.payload.can_send_media_messages
  }

  /**
   * `true`, if the user is allowed to send polls, implies `can_send_messages`
   */
  @Inspect({ compute: true, nullable: false })
  canSendPolls (): boolean | undefined {
    return this.payload.can_send_polls
  }

  /**
   * `true`, if the user is allowed to send animations, games, stickers and use
   * inline bots, implies `can_send_media_messages`
   */
  @Inspect({ compute: true, nullable: false })
  canSendOtherMessages (): boolean | undefined {
    return this.payload.can_send_other_messages
  }

  /**
   * `true`, if the user is allowed to add web page previews to their messages,
   * implies `can_send_media_messages`
   */
  @Inspect({ compute: true, nullable: false })
  canAddWebPagePreviews (): boolean | undefined {
    return this.payload.can_add_web_page_previews
  }

  /**
   * `true`, if the user is allowed to change the chat title, photo and other
   * settings. Ignored in public supergroups
   */
  @Inspect({ compute: true, nullable: false })
  canChangeInfo (): boolean | undefined {
    return this.payload.can_change_info
  }

  /** `true`, if the user is allowed to invite new users to the chat */
  @Inspect({ compute: true, nullable: false })
  canInviteUsers (): boolean | undefined {
    return this.payload.can_invite_users
  }

  /**
   * `true`, if the user is allowed to pin messages. Ignored in public
   * supergroups
   */
  @Inspect({ compute: true, nullable: false })
  canPinMessages (): boolean | undefined {
    return this.payload.can_pin_messages
  }

  /** `true`, if the user is allowed to create forum topics. If omitted defaults to the value of can_pin_messages */
  @Inspect({ compute: true, nullable: false })
  canManageTopics (): boolean | undefined {
    return this.payload.can_manage_topics
  }

  toJSON () {
    return this.payload
  }
}
