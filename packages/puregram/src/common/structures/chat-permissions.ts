import { inspectable } from 'inspectable';

import { TelegramChatPermissions } from '../../telegram-interfaces';
import { filterPayload } from '../../utils/helpers';

/**
 * Describes actions that a non-administrator user is allowed to take in a
 * chat.
 */
export class ChatPermissions {
  private payload: TelegramChatPermissions;

  constructor(payload: TelegramChatPermissions) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /**
   * `true`, if the user is allowed to send text messages, contacts, locations
   * and venues
   */
  public get canSendMessages(): boolean | undefined {
    return this.payload.can_send_messages;
  }

  /**
   * `true`, if the user is allowed to send audios, documents, photos, videos,
   * video notes and voice notes, implies `can_send_messages`
   */
  public get canSendMediaMessages(): boolean | undefined {
    return this.payload.can_send_media_messages;
  }

  /**
   * `true`, if the user is allowed to send polls, implies `can_send_messages`
   */
  public get canSendPolls(): boolean | undefined {
    return this.payload.can_send_polls;
  }

  /**
   * `true`, if the user is allowed to send animations, games, stickers and use
   * inline bots, implies `can_send_media_messages`
   */
  public get canSendOtherMessages(): boolean | undefined {
    return this.payload.can_send_other_messages;
  }

  /**
   * `true`, if the user is allowed to add web page previews to their messages,
   * implies `can_send_media_messages`
   */
  public get canAddWebPagePreviews(): boolean | undefined {
    return this.payload.can_add_web_page_previews;
  }

  /**
   * `true`, if the user is allowed to change the chat title, photo and other
   * settings. Ignored in public supergroups
   */
  public get canChangeInfo(): boolean | undefined {
    return this.payload.can_change_info;
  }

  /** `true`, if the user is allowed to invite new users to the chat */
  public get canInviteUsers(): boolean | undefined {
    return this.payload.can_invite_users;
  }

  /**
   * `true`, if the user is allowed to pin messages. Ignored in public
   * supergroups
   */
  public get canPinMessages(): boolean | undefined {
    return this.payload.can_pin_messages;
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
    };

    return filterPayload(payload);
  }
});
