import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

/**
 * Describes actions that a non-administrator user is allowed to take in a
 * chat.
 */
export class ChatPermissions {
  constructor(private payload: Interfaces.TelegramChatPermissions) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /**
   * `true`, if the user is allowed to send text messages, contacts, locations
   * and venues
   */
  get canSendMessages() {
    return this.payload.can_send_messages
  }

  /**
   * `true`, if the user is allowed to send audios, documents, photos, videos,
   * video notes and voice notes, implies `can_send_messages`
   */
  get canSendMediaMessages() {
    return this.payload.can_send_media_messages
  }

  /**
   * `true`, if the user is allowed to send polls, implies `can_send_messages`
   */
  get canSendPolls() {
    return this.payload.can_send_polls
  }

  /**
   * `true`, if the user is allowed to send animations, games, stickers and use
   * inline bots, implies `can_send_media_messages`
   */
  get canSendOtherMessages() {
    return this.payload.can_send_other_messages
  }

  /**
   * `true`, if the user is allowed to add web page previews to their messages,
   * implies `can_send_media_messages`
   */
  get canAddWebPagePreviews() {
    return this.payload.can_add_web_page_previews
  }

  /**
   * `true`, if the user is allowed to change the chat title, photo and other
   * settings. Ignored in public supergroups
   */
  get canChangeInfo() {
    return this.payload.can_change_info
  }

  /** `true`, if the user is allowed to invite new users to the chat */
  get canInviteUsers() {
    return this.payload.can_invite_users
  }

  /**
   * `true`, if the user is allowed to pin messages. Ignored in public
   * supergroups
   */
  get canPinMessages() {
    return this.payload.can_pin_messages
  }
}

inspectable(ChatPermissions, {
  serialize(permissions: ChatPermissions) {
    const payload = {
      canSendMessages: permissions.canSendMessages,
      canSendMediaMessages: permissions.canSendMediaMessages,
      canSendPolls: permissions.canSendPolls,
      canSendOtherMessages: permissions.canSendOtherMessages,
      canAddWebPagePreviews: permissions.canAddWebPagePreviews,
      canChangeInfo: permissions.canChangeInfo,
      canInviteUsers: permissions.canInviteUsers,
      canPinMessages: permissions.canPinMessages
    }

    return filterPayload(payload)
  }
})
