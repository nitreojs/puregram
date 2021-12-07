import { inspectable } from 'inspectable';

import { ChatPhoto } from './chat-photo';
import { ChatPermissions } from './chat-permissions';
import { ChatLocation } from './chat-location';

import { Message } from '../../updates/message';
import { filterPayload } from '../../utils/helpers';
import { TelegramChat } from '../../telegram-interfaces';

/** This object represents a chat. */
export class Chat {
  private payload: TelegramChat;

  constructor(payload: TelegramChat) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /**
   * Unique identifier for this chat. This number may be greater than 32 bits
   * and some programming languages may have difficulty/silent defects in
   * interpreting it. But it is smaller than 52 bits, so a signed 64 bit
   * integer or double-precision float type are safe for storing
   * this identifier.
   */
  public get id(): number {
    return this.payload.id;
  }

  /**
   * Type of chat, can be either `private`, `group`, `supergroup` or `channel`
   */
  public get type(): TelegramChat['type'] {
    return this.payload.type;
  }

  /** Title, for supergroups, channels and group chats */
  public get title(): string | undefined {
    return this.payload.title;
  }

  /** Username, for private chats, supergroups and channels if available */
  public get username(): string | undefined {
    return this.payload.username;
  }

  /** First name of the other party in a private chat */
  public get firstName(): string | undefined {
    return this.payload.first_name;
  }

  /** Last name of the other party in a private chat */
  public get lastName(): string | undefined {
    return this.payload.last_name;
  }

  /**
   * Chat photo.
   *
   * Returned only in `getChat`.
   */
  public get photo(): ChatPhoto | undefined {
    const { photo } = this.payload;

    if (!photo) return undefined;

    return new ChatPhoto(photo);
  }

  /**
   * Bio of the other party in a private chat.
   * 
   * Returned only in `getChat`.
   */
  public get bio(): string | undefined {
    return this.payload.bio;
  }

  /**
   * `true`, if privacy settings of the other party in the private chat allows
   * to use `tg://user?id=<user_id>` links only in chats with the user.
   * 
   * Returned only in `getChat`.
   */
  public get hasPrivateForwards(): true | undefined {
    return this.payload.has_private_forwards as true | undefined;
  }

  /**
   * For supergroups, the location to which the supergroup is connected
   * 
   * Returned only in `getChat`.
   */
  public get location(): ChatLocation | undefined {
    const { location } = this.payload;

    if (!location) return undefined;

    return new ChatLocation(location);
  }

  /**
   * Description, for groups, supergroups and channel chats.
   *
   * Returned only in `getChat`.
   */
  public get description(): string | undefined {
    return this.payload.description;
  }

  /**
   * Chat invite link, for groups, supergroups and channel chats.
   * Each administrator in a chat generates their own invite links,
   * so the bot must first generate the link using `exportChatInviteLink`.
   *
   * Returned only in `getChat`.
   */
  public get inviteLink(): string | undefined {
    return this.payload.invite_link;
  }

  /**
   * Pinned message, for groups, supergroups and channels.
   *
   * Returned only in `getChat`.
   */
  public get pinnedMessage(): Message | undefined {
    const { pinned_message } = this.payload;

    if (!pinned_message) return undefined;

    return new Message(pinned_message);
  }

  /**
   * Default chat member permissions, for groups and supergroups.
   *
   * Returned only in `getChat`.
   */
  public get permissions(): ChatPermissions | undefined {
    const { permissions } = this.payload;

    if (!permissions) return undefined;

    return new ChatPermissions(permissions);
  }

  /**
   * For supergroups, the minimum allowed delay between consecutive messages
   * sent by each unpriviledged user.
   *
   * Returned only in `getChat`.
   */
  public get slowModeDelay(): number | undefined {
    return this.payload.slow_mode_delay;
  }

  /**
   * The time after which all messages sent to the chat will be automatically deleted; in seconds.
   * 
   * Returned only in `getChat`.
   */
  public get messageAutoDeleteTime(): number | undefined {
    return this.payload.message_auto_delete_time;
  }

  /**
   * `true`, if messages from the chat can't be forwarded to other chats.
   * 
   * Returned only in `getChat`.
   */
  public get hasProtectedContent(): boolean | undefined {
    return this.payload.has_protected_content;
  }

  /**
   * For supergroups, name of group sticker set.
   *
   * Returned only in `getChat`.
   */
  public get stickerSetName(): string | undefined {
    return this.payload.sticker_set_name;
  }

  /**
   * `true`, if the bot can change the group sticker set.
   *
   * Returned only in `getChat`.
   */
  public get canSetStickerSet(): boolean | undefined {
    return this.payload.can_set_sticker_set;
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
  public get linkedChatId(): number | undefined {
    return this.payload.linked_chat_id;
  }
}

inspectable(Chat, {
  serialize(chat: Chat) {
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
    };

    return filterPayload(payload);
  }
});
