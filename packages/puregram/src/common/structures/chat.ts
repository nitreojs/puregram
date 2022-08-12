import { inspectable } from 'inspectable'

import { Message } from '../../common/structures'
import { filterPayload } from '../../utils/helpers'
import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { ChatPhoto } from './chat-photo'
import { ChatPermissions } from './chat-permissions'
import { ChatLocation } from './chat-location'

/** This object represents a chat. */
export class Chat implements Structure {
  constructor (private payload: Interfaces.TelegramChat) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /**
   * Unique identifier for this chat. This number may be greater than 32 bits
   * and some programming languages may have difficulty/silent defects in
   * interpreting it. But it is smaller than 52 bits, so a signed 64 bit
   * integer or double-precision float type are safe for storing
   * this identifier.
   */
  get id () {
    return this.payload.id
  }

  /**
   * Type of chat, can be either `private`, `group`, `supergroup` or `channel`
   */
  get type () {
    return this.payload.type
  }

  /** Title, for supergroups, channels and group chats */
  get title () {
    return this.payload.title
  }

  /** Username, for private chats, supergroups and channels if available */
  get username () {
    return this.payload.username
  }

  /** First name of the other party in a private chat */
  get firstName () {
    return this.payload.first_name
  }

  /** Last name of the other party in a private chat */
  get lastName () {
    return this.payload.last_name
  }

  /**
   * Chat photo.
   *
   * Returned only in `getChat`.
   */
  get photo () {
    const { photo } = this.payload

    if (!photo) {
      return
    }

    return new ChatPhoto(photo)
  }

  /**
   * Bio of the other party in a private chat.
   *
   * Returned only in `getChat`.
   */
  get bio () {
    return this.payload.bio
  }

  /**
   * `true`, if privacy settings of the other party in the private chat allows
   * to use `tg://user?id=<user_id>` links only in chats with the user.
   *
   * Returned only in `getChat`.
   */
  hasPrivateForwards () {
    return this.payload.has_private_forwards as true | undefined
  }

  /**
   * `true`, if the privacy settings of the other party restrict sending voice and video note messages in the private chat.
   *
   * Returned only in `getChat`.
   */
  hasRestrictedVoiceAndVideoMessages () {
    return this.payload.has_restricted_voice_and_video_messages
  }

  /**
   * `true`, if users need to join the supergroup before they can send messages.
   *
   * Returned only in `getChat`.
   */
  get joinToSendMessages () {
    return this.payload.join_to_send_messages as true | undefined
  }

  /**
   * `true`, if all users directly joining the supergroup need to be approved
   * by supergroup administrators.
   *
   * Returned only in `getChat`.
   */
  get joinByRequest () {
    return this.payload.join_by_request as true | undefined
  }

  /**
   * For supergroups, the location to which the supergroup is connected
   *
   * Returned only in `getChat`.
   */
  get location () {
    const { location } = this.payload

    if (!location) {
      return
    }

    return new ChatLocation(location)
  }

  /**
   * Description, for groups, supergroups and channel chats.
   *
   * Returned only in `getChat`.
   */
  get description () {
    return this.payload.description
  }

  /**
   * Chat invite link, for groups, supergroups and channel chats.
   * Each administrator in a chat generates their own invite links,
   * so the bot must first generate the link using `exportChatInviteLink`.
   *
   * Returned only in `getChat`.
   */
  get inviteLink () {
    return this.payload.invite_link
  }

  /**
   * Pinned message, for groups, supergroups and channels.
   *
   * Returned only in `getChat`.
   */
  get pinnedMessage (): Message | undefined {
    const { pinned_message } = this.payload

    if (!pinned_message) {
      return
    }

    return new Message(pinned_message)
  }

  /**
   * Default chat member permissions, for groups and supergroups.
   *
   * Returned only in `getChat`.
   */
  get permissions () {
    const { permissions } = this.payload

    if (!permissions) {
      return
    }

    return new ChatPermissions(permissions)
  }

  /**
   * For supergroups, the minimum allowed delay between consecutive messages
   * sent by each unpriviledged user.
   *
   * Returned only in `getChat`.
   */
  get slowModeDelay () {
    return this.payload.slow_mode_delay
  }

  /**
   * The time after which all messages sent to the chat will be automatically deleted; in seconds.
   *
   * Returned only in `getChat`.
   */
  get messageAutoDeleteTime () {
    return this.payload.message_auto_delete_time
  }

  /**
   * `true`, if messages from the chat can't be forwarded to other chats.
   *
   * Returned only in `getChat`.
   */
  hasProtectedContent () {
    return this.payload.has_protected_content
  }

  /**
   * For supergroups, name of group sticker set.
   *
   * Returned only in `getChat`.
   */
  get stickerSetName () {
    return this.payload.sticker_set_name
  }

  /**
   * `true`, if the bot can change the group sticker set.
   *
   * Returned only in `getChat`.
   */
  canSetStickerSet () {
    return this.payload.can_set_sticker_set
  }

  /**
   * Unique identifier for the linked chat,
   * i.e. the discussion group identifier for a channel and vice versa;
   * for supergroups and channel chats.
   * This identifier may be greater than 32 bits and some programming languages
   * may have difficulty/silent defects in interpreting it.
   * But it is smaller than 52 bits, so a signed 64 bit integer or double-precision
   * float type are safe for storing this identifier.
   *
   * Returned only in `getChat`.
   */
  get linkedChatId () {
    return this.payload.linked_chat_id
  }

  toJSON (): Interfaces.TelegramChat {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      username: this.username,
      first_name: this.firstName,
      last_name: this.lastName,
      photo: this.photo?.toJSON(),
      bio: this.bio,
      has_private_forwards: this.hasPrivateForwards(),
      has_restricted_voice_and_video_messages: this.hasRestrictedVoiceAndVideoMessages(),
      join_to_send_messages: this.joinToSendMessages,
      join_by_request: this.joinByRequest,
      location: this.location,
      description: this.description,
      invite_link: this.inviteLink,
      pinned_message: this.pinnedMessage?.toJSON(),
      permissions: this.permissions,
      slow_mode_delay: this.slowModeDelay,
      sticker_set_name: this.stickerSetName,
      can_set_sticker_set: this.canSetStickerSet(),
      linked_chat_id: this.linkedChatId
    }
  }
}

inspectable(Chat, {
  serialize (struct) {
    const payload = {
      id: struct.id,
      type: struct.type,
      title: struct.title,
      username: struct.username,
      firstName: struct.firstName,
      lastName: struct.lastName,
      photo: struct.photo,
      bio: struct.bio,
      hasPrivateForwards: struct.hasPrivateForwards(),
      hasRestrictedVoiceAndVideoMessages: struct.hasRestrictedVoiceAndVideoMessages(),
      joinToSendMessages: struct.joinToSendMessages,
      joinByRequest: struct.joinByRequest,
      location: struct.location,
      description: struct.description,
      inviteLink: struct.inviteLink,
      pinnedMessage: struct.pinnedMessage,
      permissions: struct.permissions,
      slowModeDelay: struct.slowModeDelay,
      stickerSetName: struct.stickerSetName,
      canSetStickerSet: struct.canSetStickerSet(),
      linkedChatId: struct.linkedChatId
    }

    return filterPayload(payload)
  }
})
