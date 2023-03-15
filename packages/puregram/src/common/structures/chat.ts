import { Inspect, Inspectable } from 'inspectable'

import { Message } from '../../common/structures'
import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { ChatPhoto } from './chat-photo'
import { ChatPermissions } from './chat-permissions'
import { ChatLocation } from './chat-location'

/** This object represents a chat. */
@Inspectable()
export class Chat implements Structure {
  constructor (public payload: Interfaces.TelegramChat) { }

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
  @Inspect()
  get id () {
    return this.payload.id
  }

  /**
   * Type of chat, can be either `private`, `group`, `supergroup` or `channel`
   */
  @Inspect()
  get type () {
    return this.payload.type
  }

  /** Title, for supergroups, channels and group chats */
  @Inspect({ nullable: false })
  get title () {
    return this.payload.title
  }

  /** Username, for private chats, supergroups and channels if available */
  @Inspect({ nullable: false })
  get username () {
    return this.payload.username
  }

  /** First name of the other party in a private chat */
  @Inspect({ nullable: false })
  get firstName () {
    return this.payload.first_name
  }

  /** Last name of the other party in a private chat */
  @Inspect({ nullable: false })
  get lastName () {
    return this.payload.last_name
  }

  /** `true`, if the supergroup chat is a forum (has [topics](https://telegram.org/blog/topics-in-groups-collectible-usernames#topics-in-groups) enabled) */
  @Inspect({ compute: true, nullable: false })
  isForum () {
    return this.payload.is_forum
  }

  /**
   * Chat photo.
   *
   * Returned only in `getChat`.
   */
  @Inspect({ nullable: false })
  get photo () {
    const { photo } = this.payload

    if (!photo) {
      return
    }

    return new ChatPhoto(photo)
  }

  /**
   * If non-empty, the list of all active chat usernames; for private chats, supergroups and channels.
   *
   * Returned only in `getChat`.
   */
  @Inspect({ nullable: false })
  get activeUsernames () {
    return this.payload.active_usernames
  }

  /**
   * Custom emoji identifier of emoji status of the other party in a private chat.
   *
   * Returned only in `getChat`.
   */
  @Inspect({ nullable: false })
  get emojiStatusCustomEmojiId () {
    return this.payload.emoji_status_custom_emoji_id
  }

  /**
   * Bio of the other party in a private chat.
   *
   * Returned only in `getChat`.
   */
  @Inspect({ nullable: false })
  get bio () {
    return this.payload.bio
  }

  /**
   * `true`, if privacy settings of the other party in the private chat allows
   * to use `tg://user?id=<user_id>` links only in chats with the user.
   *
   * Returned only in `getChat`.
   */
  @Inspect({ compute: true, nullable: false })
  hasPrivateForwards () {
    return this.payload.has_private_forwards as true | undefined
  }

  /**
   * `true`, if the privacy settings of the other party restrict sending voice and video note messages in the private chat.
   *
   * Returned only in `getChat`.
   */
  @Inspect({ compute: true, nullable: false })
  hasRestrictedVoiceAndVideoMessages () {
    return this.payload.has_restricted_voice_and_video_messages
  }

  /**
   * `true`, if users need to join the supergroup before they can send messages.
   *
   * Returned only in `getChat`.
   */
  @Inspect({ nullable: false })
  get joinToSendMessages () {
    return this.payload.join_to_send_messages as true | undefined
  }

  /**
   * `true`, if all users directly joining the supergroup need to be approved
   * by supergroup administrators.
   *
   * Returned only in `getChat`.
   */
  @Inspect({ nullable: false })
  get joinByRequest () {
    return this.payload.join_by_request as true | undefined
  }

  /**
   * For supergroups, the location to which the supergroup is connected
   *
   * Returned only in `getChat`.
   */
  @Inspect({ nullable: false })
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
  @Inspect({ nullable: false })
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
  @Inspect({ nullable: false })
  get inviteLink () {
    return this.payload.invite_link
  }

  /**
   * Pinned message, for groups, supergroups and channels.
   *
   * Returned only in `getChat`.
   */
  @Inspect({ nullable: false })
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
  @Inspect({ nullable: false })
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
  @Inspect({ nullable: false })
  get slowModeDelay () {
    return this.payload.slow_mode_delay
  }

  /**
   * The time after which all messages sent to the chat will be automatically deleted; in seconds.
   *
   * Returned only in `getChat`.
   */
  @Inspect({ nullable: false })
  get messageAutoDeleteTime () {
    return this.payload.message_auto_delete_time
  }

  /**
   * `true`, if aggressive anti-spam checks are enabled in the supergroup. The field is only available to chat administrators.
   *
   * Returned only in `getChat`.
   */
  @Inspect({ compute: true, nullable: false })
  hasAggressiveAntiSpamEnabled () {
    return this.payload.has_aggressive_anti_spam_enabled
  }

  /**
   * `true`, if non-administrators can only get the list of bots and administrators in the chat.
   *
   * Returned only in `getChat`.
   */
  @Inspect({ compute: true, nullable: false })
  hasHiddenMembers () {
    return this.payload.has_hidden_members
  }

  /**
   * `true`, if messages from the chat can't be forwarded to other chats.
   *
   * Returned only in `getChat`.
   */
  @Inspect({ compute: true, nullable: false })
  hasProtectedContent () {
    return this.payload.has_protected_content
  }

  /**
   * For supergroups, name of group sticker set.
   *
   * Returned only in `getChat`.
   */
  @Inspect({ nullable: false })
  get stickerSetName () {
    return this.payload.sticker_set_name
  }

  /**
   * `true`, if the bot can change the group sticker set.
   *
   * Returned only in `getChat`.
   */
  @Inspect({ compute: true, nullable: false })
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
  @Inspect({ nullable: false })
  get linkedChatId () {
    return this.payload.linked_chat_id
  }

  toJSON () {
    return this.payload
  }
}
