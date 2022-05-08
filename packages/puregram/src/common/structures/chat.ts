import { inspectable } from 'inspectable'

import { Message } from '../../updates/message'
import { filterPayload } from '../../utils/helpers'
import * as Interfaces from '../../generated/telegram-interfaces'

import { ChatPhoto } from './chat-photo'
import { ChatPermissions } from './chat-permissions'
import { ChatLocation } from './chat-location'

/** This object represents a chat. */
export class Chat {
  constructor(private payload: Interfaces.TelegramChat) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /**
   * Unique identifier for this chat. This number may be greater than 32 bits
   * and some programming languages may have difficulty/silent defects in
   * interpreting it. But it is smaller than 52 bits, so a signed 64 bit
   * integer or double-precision float type are safe for storing
   * this identifier.
   */
  get id() {
    return this.payload.id
  }

  /**
   * Type of chat, can be either `private`, `group`, `supergroup` or `channel`
   */
  get type() {
    return this.payload.type
  }

  /** Title, for supergroups, channels and group chats */
  get title() {
    return this.payload.title
  }

  /** Username, for private chats, supergroups and channels if available */
  get username() {
    return this.payload.username
  }

  /** First name of the other party in a private chat */
  get firstName() {
    return this.payload.first_name
  }

  /** Last name of the other party in a private chat */
  get lastName() {
    return this.payload.last_name
  }

  /**
   * Chat photo.
   *
   * Returned only in `getChat`.
   */
  get photo() {
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
  get bio() {
    return this.payload.bio
  }

  /**
   * `true`, if privacy settings of the other party in the private chat allows
   * to use `tg://user?id=<user_id>` links only in chats with the user.
   * 
   * Returned only in `getChat`.
   */
  get hasPrivateForwards() {
    return this.payload.has_private_forwards as true | undefined
  }

  /**
   * For supergroups, the location to which the supergroup is connected
   * 
   * Returned only in `getChat`.
   */
  get location() {
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
  get description() {
    return this.payload.description
  }

  /**
   * Chat invite link, for groups, supergroups and channel chats.
   * Each administrator in a chat generates their own invite links,
   * so the bot must first generate the link using `exportChatInviteLink`.
   *
   * Returned only in `getChat`.
   */
  get inviteLink() {
    return this.payload.invite_link
  }

  /**
   * Pinned message, for groups, supergroups and channels.
   *
   * Returned only in `getChat`.
   */
  get pinnedMessage(): Message | undefined {
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
  get permissions() {
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
  get slowModeDelay() {
    return this.payload.slow_mode_delay
  }

  /**
   * The time after which all messages sent to the chat will be automatically deleted; in seconds.
   * 
   * Returned only in `getChat`.
   */
  get messageAutoDeleteTime() {
    return this.payload.message_auto_delete_time
  }

  /**
   * `true`, if messages from the chat can't be forwarded to other chats.
   * 
   * Returned only in `getChat`.
   */
  get hasProtectedContent() {
    return this.payload.has_protected_content
  }

  /**
   * For supergroups, name of group sticker set.
   *
   * Returned only in `getChat`.
   */
  get stickerSetName() {
    return this.payload.sticker_set_name
  }

  /**
   * `true`, if the bot can change the group sticker set.
   *
   * Returned only in `getChat`.
   */
  get canSetStickerSet() {
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
  get linkedChatId() {
    return this.payload.linked_chat_id
  }
}

inspectable(Chat, {
  serialize(chat) {
    const payload = {
      id: chat.id,
      type: chat.type,
      title: chat.title,
      username: chat.username,
      firstName: chat.firstName,
      lastName: chat.lastName,
      photo: chat.photo,
      description: chat.description,
      inviteLink: chat.inviteLink,
      pinnedMessage: chat.pinnedMessage,
      permissions: chat.permissions,
      slowModeDelay: chat.slowModeDelay,
      stickerSetName: chat.stickerSetName,
      canSetStickerSet: chat.canSetStickerSet
    }

    return filterPayload(payload)
  }
})
