/// AUTO-GENERATED FILE — do not edit by hand
/// Bot API 9.6.0
/// source: https://corefork.telegram.org/bots/api
/// generated at: 2026-04-26T09:30:18.745Z
/// see scripts/emit.ts in @puregram/api

import type { TelegramMessage, TelegramMessageId, TelegramReactionType } from "./types";
import type { BanChatMemberParams, CopyMessageParams, ForwardMessageParams, PinChatMessageParams, SendMessageParams, SetMessageReactionParams, UnbanChatMemberParams, UnpinChatMessageParams } from "./methods";
export interface TelegramShortcuts {
    /**
     * Shortcut for `tg.api.sendMessage`. Use this method to send text messages. On success, the sent Message is returned.
     */
    send(chat: number | string, text: string, params?: Omit<SendMessageParams, "chat_id" | "text">): Promise<TelegramMessage>;
    /**
     * Shortcut for `tg.api.forwardMessage`. Use this method to forward messages of any kind. Service messages and messages with protected content can't be forwarded. On success, the sent Message is returned.
     */
    forward(from: number | string, to: number | string, messageId: number, params?: Omit<ForwardMessageParams, "from_chat_id" | "chat_id" | "message_id">): Promise<TelegramMessage>;
    /**
     * Shortcut for `tg.api.copyMessage`. Use this method to copy messages of any kind. Service messages, paid media messages, giveaway messages, giveaway winners messages, and invoice messages can't be copied. A quiz poll can be copied only if the value of the field correct_option_id is known to the bot. The method is analogous to the method forwardMessage, but the copied message doesn't have a link to the original message. Returns the MessageId of the sent message on success.
     */
    copy(from: number | string, to: number | string, messageId: number, params?: Omit<CopyMessageParams, "from_chat_id" | "chat_id" | "message_id">): Promise<TelegramMessageId>;
    /**
     * Shortcut for `tg.api.pinChatMessage`. Use this method to add a message to the list of pinned messages in a chat. In private chats and channel direct messages chats, all non-service messages can be pinned. Conversely, the bot must be an administrator with the 'can_pin_messages' right or the 'can_edit_messages' right to pin messages in groups and channels respectively. Returns True on success.
     */
    pin(chat: number | string, messageId: number, params?: Omit<PinChatMessageParams, "chat_id" | "message_id">): Promise<true>;
    /**
     * Shortcut for `tg.api.unpinChatMessage`. Use this method to remove a message from the list of pinned messages in a chat. In private chats and channel direct messages chats, all messages can be unpinned. Conversely, the bot must be an administrator with the 'can_pin_messages' right or the 'can_edit_messages' right to unpin messages in groups and channels respectively. Returns True on success.
     */
    unpin(chat: number | string, messageId: number, params?: Omit<UnpinChatMessageParams, "chat_id" | "message_id">): Promise<true>;
    /**
     * Shortcut for `tg.api.banChatMember`. Use this method to ban a user in a group, a supergroup or a channel. In the case of supergroups and channels, the user will not be able to return to the chat on their own using invite links, etc., unless unbanned first. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns True on success.
     */
    kick(chat: number | string, user: number, params?: Omit<BanChatMemberParams, "chat_id" | "user_id">): Promise<true>;
    /**
     * Shortcut for `tg.api.banChatMember`. Use this method to ban a user in a group, a supergroup or a channel. In the case of supergroups and channels, the user will not be able to return to the chat on their own using invite links, etc., unless unbanned first. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns True on success.
     */
    ban(chat: number | string, user: number, params?: Omit<BanChatMemberParams, "chat_id" | "user_id">): Promise<true>;
    /**
     * Shortcut for `tg.api.unbanChatMember`. Use this method to unban a previously banned user in a supergroup or channel. The user will not return to the group or channel automatically, but will be able to join via link, etc. The bot must be an administrator for this to work. By default, this method guarantees that after the call the user is not a member of the chat, but will be able to join it. So if the user is a member of the chat they will also be removed from the chat. If you don't want this, use the parameter only_if_banned. Returns True on success.
     */
    unban(chat: number | string, user: number, params?: Omit<UnbanChatMemberParams, "chat_id" | "user_id">): Promise<true>;
    /**
     * Shortcut for `tg.api.setMessageReaction`. Use this method to change the chosen reactions on a message. Service messages of some types can't be reacted to. Automatically forwarded messages from a channel to its discussion group have the same available reactions as messages in the channel. Bots can't use paid reactions. Returns True on success.
     */
    react(chat: number | string, messageId: number, reactions: TelegramReactionType[], params?: Omit<SetMessageReactionParams, "chat_id" | "message_id" | "reaction">): Promise<true>;
}