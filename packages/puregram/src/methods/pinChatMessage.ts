export interface PinChatMessageParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /** Identifier of a message to pin */
  message_id: number;

  /**
   * Pass `true`, if it is not necessary to send a notification to all chat
   * members about the new pinned message. Notifications are always disabled
   * in channels.
   */
  disable_notification?: boolean;

  [key: string]: any;
}

/**
 * Use this method to pin a message in a group, a supergroup, or a channel
 * The bot must be an administrator in the chat for this to work and
 * must have the `can_pin_messages` admin right in the supergroup
 * or `can_edit_messages` admin right in the channel.
 *
 * Returns `true` on success.
 */
export type pinChatMessage = (params: PinChatMessageParams) => Promise<true>;
