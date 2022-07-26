import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { Structure } from '../../types/interfaces'

/**
 * Describes actions that a non-administrator user is allowed to take in a
 * chat.
 */
export class ChatPermissions implements Structure {
  constructor (private payload: Interfaces.TelegramChatPermissions) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /**
   * `true`, if the user is allowed to send text messages, contacts, locations
   * and venues
   */
  canSendMessages () {
    return this.payload.can_send_messages
  }

  /**
   * `true`, if the user is allowed to send audios, documents, photos, videos,
   * video notes and voice notes, implies `can_send_messages`
   */
  canSendMediaMessages () {
    return this.payload.can_send_media_messages
  }

  /**
   * `true`, if the user is allowed to send polls, implies `can_send_messages`
   */
  canSendPolls () {
    return this.payload.can_send_polls
  }

  /**
   * `true`, if the user is allowed to send animations, games, stickers and use
   * inline bots, implies `can_send_media_messages`
   */
  canSendOtherMessages () {
    return this.payload.can_send_other_messages
  }

  /**
   * `true`, if the user is allowed to add web page previews to their messages,
   * implies `can_send_media_messages`
   */
  canAddWebPagePreviews () {
    return this.payload.can_add_web_page_previews
  }

  /**
   * `true`, if the user is allowed to change the chat title, photo and other
   * settings. Ignored in public supergroups
   */
  canChangeInfo () {
    return this.payload.can_change_info
  }

  /** `true`, if the user is allowed to invite new users to the chat */
  canInviteUsers () {
    return this.payload.can_invite_users
  }

  /**
   * `true`, if the user is allowed to pin messages. Ignored in public
   * supergroups
   */
  canPinMessages () {
    return this.payload.can_pin_messages
  }

  toJSON (): Interfaces.TelegramChatPermissions {
    return {
      can_send_messages: this.canSendMessages(),
      can_send_media_messages: this.canSendMediaMessages(),
      can_send_polls: this.canSendPolls(),
      can_send_other_messages: this.canSendOtherMessages(),
      can_add_web_page_previews: this.canAddWebPagePreviews(),
      can_change_info: this.canChangeInfo(),
      can_invite_users: this.canInviteUsers(),
      can_pin_messages: this.canPinMessages()
    }
  }
}

inspectable(ChatPermissions, {
  serialize (struct) {
    const payload = {
      canSendMessages: struct.canSendMessages(),
      canSendMediaMessages: struct.canSendMediaMessages(),
      canSendPolls: struct.canSendPolls(),
      canSendOtherMessages: struct.canSendOtherMessages(),
      canAddWebPagePreviews: struct.canAddWebPagePreviews(),
      canChangeInfo: struct.canChangeInfo(),
      canInviteUsers: struct.canInviteUsers(),
      canPinMessages: struct.canPinMessages()
    }

    return filterPayload(payload)
  }
})
