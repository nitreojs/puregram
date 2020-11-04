export interface UnpinChatMessageParams {
  /**
   * Unique identifier for the target chat or username of the target channel
   * (in the format `@channelusername`)
   */
  chat_id: number | string;

  /**
   * Identifier of a message to unpin
   * If not specified, the most recent pinned message (by sending date) will be unpinned.
   */
  message_id?: number;
}

/**
 * Use this method to unpin a message in a group, a supergroup, or a channel.
 * The bot must be an administrator in the chat for this to work and
 * must have the `can_pin_messages` admin right in the supergroup
 * or `can_edit_messages` admin right in the channel.
 *
 * Returns `true` on success.
 */
export type unpinChatMessage = (
  params: UnpinChatMessageParams
) => Promise<true>;
