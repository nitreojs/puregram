/// AUTO-GENERATED FILE — do not edit by hand
/// Bot API 9.6.0
/// source: https://corefork.telegram.org/bots/api
/// generated at: 2026-04-26T09:30:18.745Z
/// see scripts/emit.ts in @puregram/api

import { defineFilter } from "../filter-runtime";
import type { Filter } from "../filter-runtime";
import type { AnyUpdate } from "../custom-update";
import type { UpdateKind, UpdateKindMap } from "./updates";
/**
 * Filter — true if the update has `actorChat` set.
 */
export const hasActorChat: Filter<AnyUpdate, {
    actorChat: NonNullable<unknown>;
}> = defineFilter("hasActorChat", (u: AnyUpdate): u is AnyUpdate => ((u as {
    actorChat?: unknown;
}).actorChat != null), { kinds: ["message_reaction"] });

/**
 * Filter — true if the update has `animation` set.
 */
export const hasAnimation: Filter<AnyUpdate, {
    animation: NonNullable<unknown>;
}> = defineFilter("hasAnimation", (u: AnyUpdate): u is AnyUpdate => ((u as {
    animation?: unknown;
}).animation != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `audio` set.
 */
export const hasAudio: Filter<AnyUpdate, {
    audio: NonNullable<unknown>;
}> = defineFilter("hasAudio", (u: AnyUpdate): u is AnyUpdate => ((u as {
    audio?: unknown;
}).audio != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `authorSignature` set.
 */
export const hasAuthorSignature: Filter<AnyUpdate, {
    authorSignature: NonNullable<unknown>;
}> = defineFilter("hasAuthorSignature", (u: AnyUpdate): u is AnyUpdate => ((u as {
    authorSignature?: unknown;
}).authorSignature != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `bio` set.
 */
export const hasBio: Filter<AnyUpdate, {
    bio: NonNullable<unknown>;
}> = defineFilter("hasBio", (u: AnyUpdate): u is AnyUpdate => ((u as {
    bio?: unknown;
}).bio != null), { kinds: ["chat_join_request"] });

/**
 * Filter — true if the update has `boostAdded` set.
 */
export const hasBoostAdded: Filter<AnyUpdate, {
    boostAdded: NonNullable<unknown>;
}> = defineFilter("hasBoostAdded", (u: AnyUpdate): u is AnyUpdate => ((u as {
    boostAdded?: unknown;
}).boostAdded != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `businessConnectionId` set.
 */
export const hasBusinessConnectionId: Filter<AnyUpdate, {
    businessConnectionId: NonNullable<unknown>;
}> = defineFilter("hasBusinessConnectionId", (u: AnyUpdate): u is AnyUpdate => ((u as {
    businessConnectionId?: unknown;
}).businessConnectionId != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `caption` set.
 */
export const hasCaption: Filter<AnyUpdate, {
    caption: NonNullable<unknown>;
}> = defineFilter("hasCaption", (u: AnyUpdate): u is AnyUpdate => ((u as {
    caption?: unknown;
}).caption != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `captionEntities` set.
 */
export const hasCaptionEntities: Filter<AnyUpdate, {
    captionEntities: NonNullable<unknown>;
}> = defineFilter("hasCaptionEntities", (u: AnyUpdate): u is AnyUpdate => ((u as {
    captionEntities?: unknown;
}).captionEntities != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `channelChatCreated` set.
 */
export const hasChannelChatCreated: Filter<AnyUpdate, {
    channelChatCreated: NonNullable<unknown>;
}> = defineFilter("hasChannelChatCreated", (u: AnyUpdate): u is AnyUpdate => ((u as {
    channelChatCreated?: unknown;
}).channelChatCreated != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `chatBackgroundSet` set.
 */
export const hasChatBackgroundSet: Filter<AnyUpdate, {
    chatBackgroundSet: NonNullable<unknown>;
}> = defineFilter("hasChatBackgroundSet", (u: AnyUpdate): u is AnyUpdate => ((u as {
    chatBackgroundSet?: unknown;
}).chatBackgroundSet != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `chatOwnerChanged` set.
 */
export const hasChatOwnerChanged: Filter<AnyUpdate, {
    chatOwnerChanged: NonNullable<unknown>;
}> = defineFilter("hasChatOwnerChanged", (u: AnyUpdate): u is AnyUpdate => ((u as {
    chatOwnerChanged?: unknown;
}).chatOwnerChanged != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `chatOwnerLeft` set.
 */
export const hasChatOwnerLeft: Filter<AnyUpdate, {
    chatOwnerLeft: NonNullable<unknown>;
}> = defineFilter("hasChatOwnerLeft", (u: AnyUpdate): u is AnyUpdate => ((u as {
    chatOwnerLeft?: unknown;
}).chatOwnerLeft != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `chatShared` set.
 */
export const hasChatShared: Filter<AnyUpdate, {
    chatShared: NonNullable<unknown>;
}> = defineFilter("hasChatShared", (u: AnyUpdate): u is AnyUpdate => ((u as {
    chatShared?: unknown;
}).chatShared != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `chatType` set.
 */
export const hasChatType: Filter<AnyUpdate, {
    chatType: NonNullable<unknown>;
}> = defineFilter("hasChatType", (u: AnyUpdate): u is AnyUpdate => ((u as {
    chatType?: unknown;
}).chatType != null), { kinds: ["inline_query"] });

/**
 * Filter — true if the update has `checklist` set.
 */
export const hasChecklist: Filter<AnyUpdate, {
    checklist: NonNullable<unknown>;
}> = defineFilter("hasChecklist", (u: AnyUpdate): u is AnyUpdate => ((u as {
    checklist?: unknown;
}).checklist != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `checklistTasksAdded` set.
 */
export const hasChecklistTasksAdded: Filter<AnyUpdate, {
    checklistTasksAdded: NonNullable<unknown>;
}> = defineFilter("hasChecklistTasksAdded", (u: AnyUpdate): u is AnyUpdate => ((u as {
    checklistTasksAdded?: unknown;
}).checklistTasksAdded != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `checklistTasksDone` set.
 */
export const hasChecklistTasksDone: Filter<AnyUpdate, {
    checklistTasksDone: NonNullable<unknown>;
}> = defineFilter("hasChecklistTasksDone", (u: AnyUpdate): u is AnyUpdate => ((u as {
    checklistTasksDone?: unknown;
}).checklistTasksDone != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `closeDate` set.
 */
export const hasCloseDate: Filter<AnyUpdate, {
    closeDate: NonNullable<unknown>;
}> = defineFilter("hasCloseDate", (u: AnyUpdate): u is AnyUpdate => ((u as {
    closeDate?: unknown;
}).closeDate != null), { kinds: ["poll"] });

/**
 * Filter — true if the update has `connectedWebsite` set.
 */
export const hasConnectedWebsite: Filter<AnyUpdate, {
    connectedWebsite: NonNullable<unknown>;
}> = defineFilter("hasConnectedWebsite", (u: AnyUpdate): u is AnyUpdate => ((u as {
    connectedWebsite?: unknown;
}).connectedWebsite != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `contact` set.
 */
export const hasContact: Filter<AnyUpdate, {
    contact: NonNullable<unknown>;
}> = defineFilter("hasContact", (u: AnyUpdate): u is AnyUpdate => ((u as {
    contact?: unknown;
}).contact != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `correctOptionIds` set.
 */
export const hasCorrectOptionIds: Filter<AnyUpdate, {
    correctOptionIds: NonNullable<unknown>;
}> = defineFilter("hasCorrectOptionIds", (u: AnyUpdate): u is AnyUpdate => ((u as {
    correctOptionIds?: unknown;
}).correctOptionIds != null), { kinds: ["poll"] });

/**
 * Filter — true if the update has `data` set.
 */
export const hasData: Filter<AnyUpdate, {
    data: NonNullable<unknown>;
}> = defineFilter("hasData", (u: AnyUpdate): u is AnyUpdate => ((u as {
    data?: unknown;
}).data != null), { kinds: ["callback_query"] });

/**
 * Filter — true if the update has `deleteChatPhoto` set.
 */
export const hasDeleteChatPhoto: Filter<AnyUpdate, {
    deleteChatPhoto: NonNullable<unknown>;
}> = defineFilter("hasDeleteChatPhoto", (u: AnyUpdate): u is AnyUpdate => ((u as {
    deleteChatPhoto?: unknown;
}).deleteChatPhoto != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `description` set.
 */
export const hasDescription: Filter<AnyUpdate, {
    description: NonNullable<unknown>;
}> = defineFilter("hasDescription", (u: AnyUpdate): u is AnyUpdate => ((u as {
    description?: unknown;
}).description != null), { kinds: ["poll"] });

/**
 * Filter — true if the update has `descriptionEntities` set.
 */
export const hasDescriptionEntities: Filter<AnyUpdate, {
    descriptionEntities: NonNullable<unknown>;
}> = defineFilter("hasDescriptionEntities", (u: AnyUpdate): u is AnyUpdate => ((u as {
    descriptionEntities?: unknown;
}).descriptionEntities != null), { kinds: ["poll"] });

/**
 * Filter — true if the update has `dice` set.
 */
export const hasDice: Filter<AnyUpdate, {
    dice: NonNullable<unknown>;
}> = defineFilter("hasDice", (u: AnyUpdate): u is AnyUpdate => ((u as {
    dice?: unknown;
}).dice != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `directMessagePriceChanged` set.
 */
export const hasDirectMessagePriceChanged: Filter<AnyUpdate, {
    directMessagePriceChanged: NonNullable<unknown>;
}> = defineFilter("hasDirectMessagePriceChanged", (u: AnyUpdate): u is AnyUpdate => ((u as {
    directMessagePriceChanged?: unknown;
}).directMessagePriceChanged != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `directMessagesTopic` set.
 */
export const hasDirectMessagesTopic: Filter<AnyUpdate, {
    directMessagesTopic: NonNullable<unknown>;
}> = defineFilter("hasDirectMessagesTopic", (u: AnyUpdate): u is AnyUpdate => ((u as {
    directMessagesTopic?: unknown;
}).directMessagesTopic != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `document` set.
 */
export const hasDocument: Filter<AnyUpdate, {
    document: NonNullable<unknown>;
}> = defineFilter("hasDocument", (u: AnyUpdate): u is AnyUpdate => ((u as {
    document?: unknown;
}).document != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `editDate` set.
 */
export const hasEditDate: Filter<AnyUpdate, {
    editDate: NonNullable<unknown>;
}> = defineFilter("hasEditDate", (u: AnyUpdate): u is AnyUpdate => ((u as {
    editDate?: unknown;
}).editDate != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `effectId` set.
 */
export const hasEffectId: Filter<AnyUpdate, {
    effectId: NonNullable<unknown>;
}> = defineFilter("hasEffectId", (u: AnyUpdate): u is AnyUpdate => ((u as {
    effectId?: unknown;
}).effectId != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `entities` set.
 */
export const hasEntities: Filter<AnyUpdate, {
    entities: NonNullable<unknown>;
}> = defineFilter("hasEntities", (u: AnyUpdate): u is AnyUpdate => ((u as {
    entities?: unknown;
}).entities != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `explanation` set.
 */
export const hasExplanation: Filter<AnyUpdate, {
    explanation: NonNullable<unknown>;
}> = defineFilter("hasExplanation", (u: AnyUpdate): u is AnyUpdate => ((u as {
    explanation?: unknown;
}).explanation != null), { kinds: ["poll"] });

/**
 * Filter — true if the update has `explanationEntities` set.
 */
export const hasExplanationEntities: Filter<AnyUpdate, {
    explanationEntities: NonNullable<unknown>;
}> = defineFilter("hasExplanationEntities", (u: AnyUpdate): u is AnyUpdate => ((u as {
    explanationEntities?: unknown;
}).explanationEntities != null), { kinds: ["poll"] });

/**
 * Filter — true if the update has `externalReply` set.
 */
export const hasExternalReply: Filter<AnyUpdate, {
    externalReply: NonNullable<unknown>;
}> = defineFilter("hasExternalReply", (u: AnyUpdate): u is AnyUpdate => ((u as {
    externalReply?: unknown;
}).externalReply != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `forumTopicClosed` set.
 */
export const hasForumTopicClosed: Filter<AnyUpdate, {
    forumTopicClosed: NonNullable<unknown>;
}> = defineFilter("hasForumTopicClosed", (u: AnyUpdate): u is AnyUpdate => ((u as {
    forumTopicClosed?: unknown;
}).forumTopicClosed != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `forumTopicCreated` set.
 */
export const hasForumTopicCreated: Filter<AnyUpdate, {
    forumTopicCreated: NonNullable<unknown>;
}> = defineFilter("hasForumTopicCreated", (u: AnyUpdate): u is AnyUpdate => ((u as {
    forumTopicCreated?: unknown;
}).forumTopicCreated != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `forumTopicEdited` set.
 */
export const hasForumTopicEdited: Filter<AnyUpdate, {
    forumTopicEdited: NonNullable<unknown>;
}> = defineFilter("hasForumTopicEdited", (u: AnyUpdate): u is AnyUpdate => ((u as {
    forumTopicEdited?: unknown;
}).forumTopicEdited != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `forumTopicReopened` set.
 */
export const hasForumTopicReopened: Filter<AnyUpdate, {
    forumTopicReopened: NonNullable<unknown>;
}> = defineFilter("hasForumTopicReopened", (u: AnyUpdate): u is AnyUpdate => ((u as {
    forumTopicReopened?: unknown;
}).forumTopicReopened != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `forwardOrigin` set.
 */
export const hasForwardOrigin: Filter<AnyUpdate, {
    forwardOrigin: NonNullable<unknown>;
}> = defineFilter("hasForwardOrigin", (u: AnyUpdate): u is AnyUpdate => ((u as {
    forwardOrigin?: unknown;
}).forwardOrigin != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `from` set.
 */
export const hasFrom: Filter<AnyUpdate, {
    from: NonNullable<unknown>;
}> = defineFilter("hasFrom", (u: AnyUpdate): u is AnyUpdate => ((u as {
    from?: unknown;
}).from != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `game` set.
 */
export const hasGame: Filter<AnyUpdate, {
    game: NonNullable<unknown>;
}> = defineFilter("hasGame", (u: AnyUpdate): u is AnyUpdate => ((u as {
    game?: unknown;
}).game != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `gameShortName` set.
 */
export const hasGameShortName: Filter<AnyUpdate, {
    gameShortName: NonNullable<unknown>;
}> = defineFilter("hasGameShortName", (u: AnyUpdate): u is AnyUpdate => ((u as {
    gameShortName?: unknown;
}).gameShortName != null), { kinds: ["callback_query"] });

/**
 * Filter — true if the update has `generalForumTopicHidden` set.
 */
export const hasGeneralForumTopicHidden: Filter<AnyUpdate, {
    generalForumTopicHidden: NonNullable<unknown>;
}> = defineFilter("hasGeneralForumTopicHidden", (u: AnyUpdate): u is AnyUpdate => ((u as {
    generalForumTopicHidden?: unknown;
}).generalForumTopicHidden != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `generalForumTopicUnhidden` set.
 */
export const hasGeneralForumTopicUnhidden: Filter<AnyUpdate, {
    generalForumTopicUnhidden: NonNullable<unknown>;
}> = defineFilter("hasGeneralForumTopicUnhidden", (u: AnyUpdate): u is AnyUpdate => ((u as {
    generalForumTopicUnhidden?: unknown;
}).generalForumTopicUnhidden != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `gift` set.
 */
export const hasGift: Filter<AnyUpdate, {
    gift: NonNullable<unknown>;
}> = defineFilter("hasGift", (u: AnyUpdate): u is AnyUpdate => ((u as {
    gift?: unknown;
}).gift != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `giftUpgradeSent` set.
 */
export const hasGiftUpgradeSent: Filter<AnyUpdate, {
    giftUpgradeSent: NonNullable<unknown>;
}> = defineFilter("hasGiftUpgradeSent", (u: AnyUpdate): u is AnyUpdate => ((u as {
    giftUpgradeSent?: unknown;
}).giftUpgradeSent != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `giveaway` set.
 */
export const hasGiveaway: Filter<AnyUpdate, {
    giveaway: NonNullable<unknown>;
}> = defineFilter("hasGiveaway", (u: AnyUpdate): u is AnyUpdate => ((u as {
    giveaway?: unknown;
}).giveaway != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `giveawayCompleted` set.
 */
export const hasGiveawayCompleted: Filter<AnyUpdate, {
    giveawayCompleted: NonNullable<unknown>;
}> = defineFilter("hasGiveawayCompleted", (u: AnyUpdate): u is AnyUpdate => ((u as {
    giveawayCompleted?: unknown;
}).giveawayCompleted != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `giveawayCreated` set.
 */
export const hasGiveawayCreated: Filter<AnyUpdate, {
    giveawayCreated: NonNullable<unknown>;
}> = defineFilter("hasGiveawayCreated", (u: AnyUpdate): u is AnyUpdate => ((u as {
    giveawayCreated?: unknown;
}).giveawayCreated != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `giveawayWinners` set.
 */
export const hasGiveawayWinners: Filter<AnyUpdate, {
    giveawayWinners: NonNullable<unknown>;
}> = defineFilter("hasGiveawayWinners", (u: AnyUpdate): u is AnyUpdate => ((u as {
    giveawayWinners?: unknown;
}).giveawayWinners != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `groupChatCreated` set.
 */
export const hasGroupChatCreated: Filter<AnyUpdate, {
    groupChatCreated: NonNullable<unknown>;
}> = defineFilter("hasGroupChatCreated", (u: AnyUpdate): u is AnyUpdate => ((u as {
    groupChatCreated?: unknown;
}).groupChatCreated != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `inlineMessageId` set.
 */
export const hasInlineMessageId: Filter<AnyUpdate, {
    inlineMessageId: NonNullable<unknown>;
}> = defineFilter("hasInlineMessageId", (u: AnyUpdate): u is AnyUpdate => ((u as {
    inlineMessageId?: unknown;
}).inlineMessageId != null), { kinds: ["chosen_inline_result", "callback_query"] });

/**
 * Filter — true if the update has `inviteLink` set.
 */
export const hasInviteLink: Filter<AnyUpdate, {
    inviteLink: NonNullable<unknown>;
}> = defineFilter("hasInviteLink", (u: AnyUpdate): u is AnyUpdate => ((u as {
    inviteLink?: unknown;
}).inviteLink != null), { kinds: ["my_chat_member", "chat_member", "chat_join_request"] });

/**
 * Filter — true if the update has `invoice` set.
 */
export const hasInvoice: Filter<AnyUpdate, {
    invoice: NonNullable<unknown>;
}> = defineFilter("hasInvoice", (u: AnyUpdate): u is AnyUpdate => ((u as {
    invoice?: unknown;
}).invoice != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `leftChatMember` set.
 */
export const hasLeftChatMember: Filter<AnyUpdate, {
    leftChatMember: NonNullable<unknown>;
}> = defineFilter("hasLeftChatMember", (u: AnyUpdate): u is AnyUpdate => ((u as {
    leftChatMember?: unknown;
}).leftChatMember != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `linkPreviewOptions` set.
 */
export const hasLinkPreviewOptions: Filter<AnyUpdate, {
    linkPreviewOptions: NonNullable<unknown>;
}> = defineFilter("hasLinkPreviewOptions", (u: AnyUpdate): u is AnyUpdate => ((u as {
    linkPreviewOptions?: unknown;
}).linkPreviewOptions != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `location` set.
 */
export const hasLocation: Filter<AnyUpdate, {
    location: NonNullable<unknown>;
}> = defineFilter("hasLocation", (u: AnyUpdate): u is AnyUpdate => ((u as {
    location?: unknown;
}).location != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "inline_query", "chosen_inline_result", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `managedBotCreated` set.
 */
export const hasManagedBotCreated: Filter<AnyUpdate, {
    managedBotCreated: NonNullable<unknown>;
}> = defineFilter("hasManagedBotCreated", (u: AnyUpdate): u is AnyUpdate => ((u as {
    managedBotCreated?: unknown;
}).managedBotCreated != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `mediaGroupId` set.
 */
export const hasMediaGroupId: Filter<AnyUpdate, {
    mediaGroupId: NonNullable<unknown>;
}> = defineFilter("hasMediaGroupId", (u: AnyUpdate): u is AnyUpdate => ((u as {
    mediaGroupId?: unknown;
}).mediaGroupId != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `message` set.
 */
export const hasMessage: Filter<AnyUpdate, {
    message: NonNullable<unknown>;
}> = defineFilter("hasMessage", (u: AnyUpdate): u is AnyUpdate => ((u as {
    message?: unknown;
}).message != null), { kinds: ["callback_query"] });

/**
 * Filter — true if the update has `messageAutoDeleteTimerChanged` set.
 */
export const hasMessageAutoDeleteTimerChanged: Filter<AnyUpdate, {
    messageAutoDeleteTimerChanged: NonNullable<unknown>;
}> = defineFilter("hasMessageAutoDeleteTimerChanged", (u: AnyUpdate): u is AnyUpdate => ((u as {
    messageAutoDeleteTimerChanged?: unknown;
}).messageAutoDeleteTimerChanged != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `messageThreadId` set.
 */
export const hasMessageThreadId: Filter<AnyUpdate, {
    messageThreadId: NonNullable<unknown>;
}> = defineFilter("hasMessageThreadId", (u: AnyUpdate): u is AnyUpdate => ((u as {
    messageThreadId?: unknown;
}).messageThreadId != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `migrateFromChatId` set.
 */
export const hasMigrateFromChatId: Filter<AnyUpdate, {
    migrateFromChatId: NonNullable<unknown>;
}> = defineFilter("hasMigrateFromChatId", (u: AnyUpdate): u is AnyUpdate => ((u as {
    migrateFromChatId?: unknown;
}).migrateFromChatId != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `migrateToChatId` set.
 */
export const hasMigrateToChatId: Filter<AnyUpdate, {
    migrateToChatId: NonNullable<unknown>;
}> = defineFilter("hasMigrateToChatId", (u: AnyUpdate): u is AnyUpdate => ((u as {
    migrateToChatId?: unknown;
}).migrateToChatId != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `newChatMembers` set.
 */
export const hasNewChatMembers: Filter<AnyUpdate, {
    newChatMembers: NonNullable<unknown>;
}> = defineFilter("hasNewChatMembers", (u: AnyUpdate): u is AnyUpdate => ((u as {
    newChatMembers?: unknown;
}).newChatMembers != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `newChatPhoto` set.
 */
export const hasNewChatPhoto: Filter<AnyUpdate, {
    newChatPhoto: NonNullable<unknown>;
}> = defineFilter("hasNewChatPhoto", (u: AnyUpdate): u is AnyUpdate => ((u as {
    newChatPhoto?: unknown;
}).newChatPhoto != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `newChatTitle` set.
 */
export const hasNewChatTitle: Filter<AnyUpdate, {
    newChatTitle: NonNullable<unknown>;
}> = defineFilter("hasNewChatTitle", (u: AnyUpdate): u is AnyUpdate => ((u as {
    newChatTitle?: unknown;
}).newChatTitle != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `openPeriod` set.
 */
export const hasOpenPeriod: Filter<AnyUpdate, {
    openPeriod: NonNullable<unknown>;
}> = defineFilter("hasOpenPeriod", (u: AnyUpdate): u is AnyUpdate => ((u as {
    openPeriod?: unknown;
}).openPeriod != null), { kinds: ["poll"] });

/**
 * Filter — true if the update has `orderInfo` set.
 */
export const hasOrderInfo: Filter<AnyUpdate, {
    orderInfo: NonNullable<unknown>;
}> = defineFilter("hasOrderInfo", (u: AnyUpdate): u is AnyUpdate => ((u as {
    orderInfo?: unknown;
}).orderInfo != null), { kinds: ["pre_checkout_query"] });

/**
 * Filter — true if the update has `paidMedia` set.
 */
export const hasPaidMedia: Filter<AnyUpdate, {
    paidMedia: NonNullable<unknown>;
}> = defineFilter("hasPaidMedia", (u: AnyUpdate): u is AnyUpdate => ((u as {
    paidMedia?: unknown;
}).paidMedia != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `paidMessagePriceChanged` set.
 */
export const hasPaidMessagePriceChanged: Filter<AnyUpdate, {
    paidMessagePriceChanged: NonNullable<unknown>;
}> = defineFilter("hasPaidMessagePriceChanged", (u: AnyUpdate): u is AnyUpdate => ((u as {
    paidMessagePriceChanged?: unknown;
}).paidMessagePriceChanged != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `paidStarCount` set.
 */
export const hasPaidStarCount: Filter<AnyUpdate, {
    paidStarCount: NonNullable<unknown>;
}> = defineFilter("hasPaidStarCount", (u: AnyUpdate): u is AnyUpdate => ((u as {
    paidStarCount?: unknown;
}).paidStarCount != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `passportData` set.
 */
export const hasPassportData: Filter<AnyUpdate, {
    passportData: NonNullable<unknown>;
}> = defineFilter("hasPassportData", (u: AnyUpdate): u is AnyUpdate => ((u as {
    passportData?: unknown;
}).passportData != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `photo` set.
 */
export const hasPhoto: Filter<AnyUpdate, {
    photo: NonNullable<unknown>;
}> = defineFilter("hasPhoto", (u: AnyUpdate): u is AnyUpdate => ((u as {
    photo?: unknown;
}).photo != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `pinnedMessage` set.
 */
export const hasPinnedMessage: Filter<AnyUpdate, {
    pinnedMessage: NonNullable<unknown>;
}> = defineFilter("hasPinnedMessage", (u: AnyUpdate): u is AnyUpdate => ((u as {
    pinnedMessage?: unknown;
}).pinnedMessage != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `poll` set.
 */
export const hasPoll: Filter<AnyUpdate, {
    poll: NonNullable<unknown>;
}> = defineFilter("hasPoll", (u: AnyUpdate): u is AnyUpdate => ((u as {
    poll?: unknown;
}).poll != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `pollOptionAdded` set.
 */
export const hasPollOptionAdded: Filter<AnyUpdate, {
    pollOptionAdded: NonNullable<unknown>;
}> = defineFilter("hasPollOptionAdded", (u: AnyUpdate): u is AnyUpdate => ((u as {
    pollOptionAdded?: unknown;
}).pollOptionAdded != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `pollOptionDeleted` set.
 */
export const hasPollOptionDeleted: Filter<AnyUpdate, {
    pollOptionDeleted: NonNullable<unknown>;
}> = defineFilter("hasPollOptionDeleted", (u: AnyUpdate): u is AnyUpdate => ((u as {
    pollOptionDeleted?: unknown;
}).pollOptionDeleted != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `proximityAlertTriggered` set.
 */
export const hasProximityAlertTriggered: Filter<AnyUpdate, {
    proximityAlertTriggered: NonNullable<unknown>;
}> = defineFilter("hasProximityAlertTriggered", (u: AnyUpdate): u is AnyUpdate => ((u as {
    proximityAlertTriggered?: unknown;
}).proximityAlertTriggered != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `questionEntities` set.
 */
export const hasQuestionEntities: Filter<AnyUpdate, {
    questionEntities: NonNullable<unknown>;
}> = defineFilter("hasQuestionEntities", (u: AnyUpdate): u is AnyUpdate => ((u as {
    questionEntities?: unknown;
}).questionEntities != null), { kinds: ["poll"] });

/**
 * Filter — true if the update has `quote` set.
 */
export const hasQuote: Filter<AnyUpdate, {
    quote: NonNullable<unknown>;
}> = defineFilter("hasQuote", (u: AnyUpdate): u is AnyUpdate => ((u as {
    quote?: unknown;
}).quote != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `refundedPayment` set.
 */
export const hasRefundedPayment: Filter<AnyUpdate, {
    refundedPayment: NonNullable<unknown>;
}> = defineFilter("hasRefundedPayment", (u: AnyUpdate): u is AnyUpdate => ((u as {
    refundedPayment?: unknown;
}).refundedPayment != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `replyMarkup` set.
 */
export const hasReplyMarkup: Filter<AnyUpdate, {
    replyMarkup: NonNullable<unknown>;
}> = defineFilter("hasReplyMarkup", (u: AnyUpdate): u is AnyUpdate => ((u as {
    replyMarkup?: unknown;
}).replyMarkup != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `replyToChecklistTaskId` set.
 */
export const hasReplyToChecklistTaskId: Filter<AnyUpdate, {
    replyToChecklistTaskId: NonNullable<unknown>;
}> = defineFilter("hasReplyToChecklistTaskId", (u: AnyUpdate): u is AnyUpdate => ((u as {
    replyToChecklistTaskId?: unknown;
}).replyToChecklistTaskId != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `replyToPollOptionId` set.
 */
export const hasReplyToPollOptionId: Filter<AnyUpdate, {
    replyToPollOptionId: NonNullable<unknown>;
}> = defineFilter("hasReplyToPollOptionId", (u: AnyUpdate): u is AnyUpdate => ((u as {
    replyToPollOptionId?: unknown;
}).replyToPollOptionId != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `replyToStory` set.
 */
export const hasReplyToStory: Filter<AnyUpdate, {
    replyToStory: NonNullable<unknown>;
}> = defineFilter("hasReplyToStory", (u: AnyUpdate): u is AnyUpdate => ((u as {
    replyToStory?: unknown;
}).replyToStory != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `rights` set.
 */
export const hasRights: Filter<AnyUpdate, {
    rights: NonNullable<unknown>;
}> = defineFilter("hasRights", (u: AnyUpdate): u is AnyUpdate => ((u as {
    rights?: unknown;
}).rights != null), { kinds: ["business_connection"] });

/**
 * Filter — true if the update has `senderBoostCount` set.
 */
export const hasSenderBoostCount: Filter<AnyUpdate, {
    senderBoostCount: NonNullable<unknown>;
}> = defineFilter("hasSenderBoostCount", (u: AnyUpdate): u is AnyUpdate => ((u as {
    senderBoostCount?: unknown;
}).senderBoostCount != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `senderBusinessBot` set.
 */
export const hasSenderBusinessBot: Filter<AnyUpdate, {
    senderBusinessBot: NonNullable<unknown>;
}> = defineFilter("hasSenderBusinessBot", (u: AnyUpdate): u is AnyUpdate => ((u as {
    senderBusinessBot?: unknown;
}).senderBusinessBot != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `senderChat` set.
 */
export const hasSenderChat: Filter<AnyUpdate, {
    senderChat: NonNullable<unknown>;
}> = defineFilter("hasSenderChat", (u: AnyUpdate): u is AnyUpdate => ((u as {
    senderChat?: unknown;
}).senderChat != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `senderTag` set.
 */
export const hasSenderTag: Filter<AnyUpdate, {
    senderTag: NonNullable<unknown>;
}> = defineFilter("hasSenderTag", (u: AnyUpdate): u is AnyUpdate => ((u as {
    senderTag?: unknown;
}).senderTag != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `shippingOptionId` set.
 */
export const hasShippingOptionId: Filter<AnyUpdate, {
    shippingOptionId: NonNullable<unknown>;
}> = defineFilter("hasShippingOptionId", (u: AnyUpdate): u is AnyUpdate => ((u as {
    shippingOptionId?: unknown;
}).shippingOptionId != null), { kinds: ["pre_checkout_query"] });

/**
 * Filter — true if the update has `showCaptionAboveMedia` set.
 */
export const hasShowCaptionAboveMedia: Filter<AnyUpdate, {
    showCaptionAboveMedia: NonNullable<unknown>;
}> = defineFilter("hasShowCaptionAboveMedia", (u: AnyUpdate): u is AnyUpdate => ((u as {
    showCaptionAboveMedia?: unknown;
}).showCaptionAboveMedia != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `sticker` set.
 */
export const hasSticker: Filter<AnyUpdate, {
    sticker: NonNullable<unknown>;
}> = defineFilter("hasSticker", (u: AnyUpdate): u is AnyUpdate => ((u as {
    sticker?: unknown;
}).sticker != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `story` set.
 */
export const hasStory: Filter<AnyUpdate, {
    story: NonNullable<unknown>;
}> = defineFilter("hasStory", (u: AnyUpdate): u is AnyUpdate => ((u as {
    story?: unknown;
}).story != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `successfulPayment` set.
 */
export const hasSuccessfulPayment: Filter<AnyUpdate, {
    successfulPayment: NonNullable<unknown>;
}> = defineFilter("hasSuccessfulPayment", (u: AnyUpdate): u is AnyUpdate => ((u as {
    successfulPayment?: unknown;
}).successfulPayment != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `suggestedPostApprovalFailed` set.
 */
export const hasSuggestedPostApprovalFailed: Filter<AnyUpdate, {
    suggestedPostApprovalFailed: NonNullable<unknown>;
}> = defineFilter("hasSuggestedPostApprovalFailed", (u: AnyUpdate): u is AnyUpdate => ((u as {
    suggestedPostApprovalFailed?: unknown;
}).suggestedPostApprovalFailed != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `suggestedPostApproved` set.
 */
export const hasSuggestedPostApproved: Filter<AnyUpdate, {
    suggestedPostApproved: NonNullable<unknown>;
}> = defineFilter("hasSuggestedPostApproved", (u: AnyUpdate): u is AnyUpdate => ((u as {
    suggestedPostApproved?: unknown;
}).suggestedPostApproved != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `suggestedPostDeclined` set.
 */
export const hasSuggestedPostDeclined: Filter<AnyUpdate, {
    suggestedPostDeclined: NonNullable<unknown>;
}> = defineFilter("hasSuggestedPostDeclined", (u: AnyUpdate): u is AnyUpdate => ((u as {
    suggestedPostDeclined?: unknown;
}).suggestedPostDeclined != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `suggestedPostInfo` set.
 */
export const hasSuggestedPostInfo: Filter<AnyUpdate, {
    suggestedPostInfo: NonNullable<unknown>;
}> = defineFilter("hasSuggestedPostInfo", (u: AnyUpdate): u is AnyUpdate => ((u as {
    suggestedPostInfo?: unknown;
}).suggestedPostInfo != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `suggestedPostPaid` set.
 */
export const hasSuggestedPostPaid: Filter<AnyUpdate, {
    suggestedPostPaid: NonNullable<unknown>;
}> = defineFilter("hasSuggestedPostPaid", (u: AnyUpdate): u is AnyUpdate => ((u as {
    suggestedPostPaid?: unknown;
}).suggestedPostPaid != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `suggestedPostRefunded` set.
 */
export const hasSuggestedPostRefunded: Filter<AnyUpdate, {
    suggestedPostRefunded: NonNullable<unknown>;
}> = defineFilter("hasSuggestedPostRefunded", (u: AnyUpdate): u is AnyUpdate => ((u as {
    suggestedPostRefunded?: unknown;
}).suggestedPostRefunded != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `supergroupChatCreated` set.
 */
export const hasSupergroupChatCreated: Filter<AnyUpdate, {
    supergroupChatCreated: NonNullable<unknown>;
}> = defineFilter("hasSupergroupChatCreated", (u: AnyUpdate): u is AnyUpdate => ((u as {
    supergroupChatCreated?: unknown;
}).supergroupChatCreated != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `text` set.
 */
export const hasText: Filter<AnyUpdate, {
    text: NonNullable<unknown>;
}> = defineFilter("hasText", (u: AnyUpdate): u is AnyUpdate => ((u as {
    text?: unknown;
}).text != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `uniqueGift` set.
 */
export const hasUniqueGift: Filter<AnyUpdate, {
    uniqueGift: NonNullable<unknown>;
}> = defineFilter("hasUniqueGift", (u: AnyUpdate): u is AnyUpdate => ((u as {
    uniqueGift?: unknown;
}).uniqueGift != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `user` set.
 */
export const hasUser: Filter<AnyUpdate, {
    user: NonNullable<unknown>;
}> = defineFilter("hasUser", (u: AnyUpdate): u is AnyUpdate => ((u as {
    user?: unknown;
}).user != null), { kinds: ["message_reaction", "poll_answer"] });

/**
 * Filter — true if the update has `usersShared` set.
 */
export const hasUsersShared: Filter<AnyUpdate, {
    usersShared: NonNullable<unknown>;
}> = defineFilter("hasUsersShared", (u: AnyUpdate): u is AnyUpdate => ((u as {
    usersShared?: unknown;
}).usersShared != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `venue` set.
 */
export const hasVenue: Filter<AnyUpdate, {
    venue: NonNullable<unknown>;
}> = defineFilter("hasVenue", (u: AnyUpdate): u is AnyUpdate => ((u as {
    venue?: unknown;
}).venue != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `viaBot` set.
 */
export const hasViaBot: Filter<AnyUpdate, {
    viaBot: NonNullable<unknown>;
}> = defineFilter("hasViaBot", (u: AnyUpdate): u is AnyUpdate => ((u as {
    viaBot?: unknown;
}).viaBot != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `viaChatFolderInviteLink` set.
 */
export const hasViaChatFolderInviteLink: Filter<AnyUpdate, {
    viaChatFolderInviteLink: NonNullable<unknown>;
}> = defineFilter("hasViaChatFolderInviteLink", (u: AnyUpdate): u is AnyUpdate => ((u as {
    viaChatFolderInviteLink?: unknown;
}).viaChatFolderInviteLink != null), { kinds: ["my_chat_member", "chat_member"] });

/**
 * Filter — true if the update has `viaJoinRequest` set.
 */
export const hasViaJoinRequest: Filter<AnyUpdate, {
    viaJoinRequest: NonNullable<unknown>;
}> = defineFilter("hasViaJoinRequest", (u: AnyUpdate): u is AnyUpdate => ((u as {
    viaJoinRequest?: unknown;
}).viaJoinRequest != null), { kinds: ["my_chat_member", "chat_member"] });

/**
 * Filter — true if the update has `video` set.
 */
export const hasVideo: Filter<AnyUpdate, {
    video: NonNullable<unknown>;
}> = defineFilter("hasVideo", (u: AnyUpdate): u is AnyUpdate => ((u as {
    video?: unknown;
}).video != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `videoChatEnded` set.
 */
export const hasVideoChatEnded: Filter<AnyUpdate, {
    videoChatEnded: NonNullable<unknown>;
}> = defineFilter("hasVideoChatEnded", (u: AnyUpdate): u is AnyUpdate => ((u as {
    videoChatEnded?: unknown;
}).videoChatEnded != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `videoChatParticipantsInvited` set.
 */
export const hasVideoChatParticipantsInvited: Filter<AnyUpdate, {
    videoChatParticipantsInvited: NonNullable<unknown>;
}> = defineFilter("hasVideoChatParticipantsInvited", (u: AnyUpdate): u is AnyUpdate => ((u as {
    videoChatParticipantsInvited?: unknown;
}).videoChatParticipantsInvited != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `videoChatScheduled` set.
 */
export const hasVideoChatScheduled: Filter<AnyUpdate, {
    videoChatScheduled: NonNullable<unknown>;
}> = defineFilter("hasVideoChatScheduled", (u: AnyUpdate): u is AnyUpdate => ((u as {
    videoChatScheduled?: unknown;
}).videoChatScheduled != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `videoChatStarted` set.
 */
export const hasVideoChatStarted: Filter<AnyUpdate, {
    videoChatStarted: NonNullable<unknown>;
}> = defineFilter("hasVideoChatStarted", (u: AnyUpdate): u is AnyUpdate => ((u as {
    videoChatStarted?: unknown;
}).videoChatStarted != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `videoNote` set.
 */
export const hasVideoNote: Filter<AnyUpdate, {
    videoNote: NonNullable<unknown>;
}> = defineFilter("hasVideoNote", (u: AnyUpdate): u is AnyUpdate => ((u as {
    videoNote?: unknown;
}).videoNote != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `voice` set.
 */
export const hasVoice: Filter<AnyUpdate, {
    voice: NonNullable<unknown>;
}> = defineFilter("hasVoice", (u: AnyUpdate): u is AnyUpdate => ((u as {
    voice?: unknown;
}).voice != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `voterChat` set.
 */
export const hasVoterChat: Filter<AnyUpdate, {
    voterChat: NonNullable<unknown>;
}> = defineFilter("hasVoterChat", (u: AnyUpdate): u is AnyUpdate => ((u as {
    voterChat?: unknown;
}).voterChat != null), { kinds: ["poll_answer"] });

/**
 * Filter — true if the update has `webAppData` set.
 */
export const hasWebAppData: Filter<AnyUpdate, {
    webAppData: NonNullable<unknown>;
}> = defineFilter("hasWebAppData", (u: AnyUpdate): u is AnyUpdate => ((u as {
    webAppData?: unknown;
}).webAppData != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

/**
 * Filter — true if the update has `writeAccessAllowed` set.
 */
export const hasWriteAccessAllowed: Filter<AnyUpdate, {
    writeAccessAllowed: NonNullable<unknown>;
}> = defineFilter("hasWriteAccessAllowed", (u: AnyUpdate): u is AnyUpdate => ((u as {
    writeAccessAllowed?: unknown;
}).writeAccessAllowed != null), { kinds: ["message", "edited_message", "channel_post", "edited_channel_post", "business_message", "edited_business_message", "new_chat_members", "left_chat_member", "new_chat_title", "new_chat_photo", "delete_chat_photo", "group_chat_created", "pinned_message", "invoice", "successful_payment", "users_shared", "chat_shared", "web_app_data", "video_chat_scheduled", "video_chat_started", "video_chat_ended", "video_chat_participants_invited", "forum_topic_created", "forum_topic_edited", "forum_topic_closed", "forum_topic_reopened", "general_forum_topic_hidden", "general_forum_topic_unhidden", "giveaway_created", "giveaway_completed", "giveaway_winners", "boost_added", "message_auto_delete_timer_changed", "migrate_to_chat_id", "migrate_from_chat_id", "passport_data", "proximity_alert_triggered", "write_access_allowed"] });

function _kind<K extends UpdateKind>(k: K): Filter<UpdateKindMap[K]> {
    return defineFilter(`kind.${k}`, (u: AnyUpdate): u is UpdateKindMap[K] => (u as {
        kind?: string;
    }).kind === k, { kinds: [k] });
}

/**
 * Filter — match a specific update kind. callable form `kind(k)` plus shorthand properties (`kind.message`, `kind.editedMessage`).
 */
export const kind = Object.assign(_kind, {
    message: _kind("message"),
    editedMessage: _kind("edited_message"),
    channelPost: _kind("channel_post"),
    editedChannelPost: _kind("edited_channel_post"),
    businessConnection: _kind("business_connection"),
    businessMessage: _kind("business_message"),
    editedBusinessMessage: _kind("edited_business_message"),
    deletedBusinessMessages: _kind("deleted_business_messages"),
    messageReaction: _kind("message_reaction"),
    messageReactionCount: _kind("message_reaction_count"),
    inlineQuery: _kind("inline_query"),
    chosenInlineResult: _kind("chosen_inline_result"),
    callbackQuery: _kind("callback_query"),
    shippingQuery: _kind("shipping_query"),
    preCheckoutQuery: _kind("pre_checkout_query"),
    poll: _kind("poll"),
    pollAnswer: _kind("poll_answer"),
    myChatMember: _kind("my_chat_member"),
    chatMember: _kind("chat_member"),
    chatJoinRequest: _kind("chat_join_request"),
    chatBoost: _kind("chat_boost"),
    removedChatBoost: _kind("removed_chat_boost"),
    newChatMembers: _kind("new_chat_members"),
    leftChatMember: _kind("left_chat_member"),
    newChatTitle: _kind("new_chat_title"),
    newChatPhoto: _kind("new_chat_photo"),
    deleteChatPhoto: _kind("delete_chat_photo"),
    groupChatCreated: _kind("group_chat_created"),
    pinnedMessage: _kind("pinned_message"),
    invoice: _kind("invoice"),
    successfulPayment: _kind("successful_payment"),
    usersShared: _kind("users_shared"),
    chatShared: _kind("chat_shared"),
    webAppData: _kind("web_app_data"),
    videoChatScheduled: _kind("video_chat_scheduled"),
    videoChatStarted: _kind("video_chat_started"),
    videoChatEnded: _kind("video_chat_ended"),
    videoChatParticipantsInvited: _kind("video_chat_participants_invited"),
    forumTopicCreated: _kind("forum_topic_created"),
    forumTopicEdited: _kind("forum_topic_edited"),
    forumTopicClosed: _kind("forum_topic_closed"),
    forumTopicReopened: _kind("forum_topic_reopened"),
    generalForumTopicHidden: _kind("general_forum_topic_hidden"),
    generalForumTopicUnhidden: _kind("general_forum_topic_unhidden"),
    giveawayCreated: _kind("giveaway_created"),
    giveawayCompleted: _kind("giveaway_completed"),
    giveawayWinners: _kind("giveaway_winners"),
    boostAdded: _kind("boost_added"),
    messageAutoDeleteTimerChanged: _kind("message_auto_delete_timer_changed"),
    migrateToChatId: _kind("migrate_to_chat_id"),
    migrateFromChatId: _kind("migrate_from_chat_id"),
    passportData: _kind("passport_data"),
    proximityAlertTriggered: _kind("proximity_alert_triggered"),
    writeAccessAllowed: _kind("write_access_allowed")
});

export type ServiceActionKind = "new_chat_members" | "left_chat_member" | "new_chat_title" | "new_chat_photo" | "delete_chat_photo" | "group_chat_created" | "pinned_message" | "invoice" | "successful_payment" | "users_shared" | "chat_shared" | "web_app_data" | "video_chat_scheduled" | "video_chat_started" | "video_chat_ended" | "video_chat_participants_invited" | "forum_topic_created" | "forum_topic_edited" | "forum_topic_closed" | "forum_topic_reopened" | "general_forum_topic_hidden" | "general_forum_topic_unhidden" | "giveaway_created" | "giveaway_completed" | "giveaway_winners" | "boost_added" | "message_auto_delete_timer_changed" | "migrate_to_chat_id" | "migrate_from_chat_id" | "passport_data" | "proximity_alert_triggered" | "write_access_allowed";

function _action<K extends ServiceActionKind>(k: K): Filter<UpdateKindMap[K]> {
    return _kind(k);
}

/**
 * Filter — match a service-event update kind. shorthand for `kind` restricted to derived (Message-payload) events.
 */
export const action = Object.assign(_action, {
    newChatMembers: _action("new_chat_members"),
    leftChatMember: _action("left_chat_member"),
    newChatTitle: _action("new_chat_title"),
    newChatPhoto: _action("new_chat_photo"),
    deleteChatPhoto: _action("delete_chat_photo"),
    groupChatCreated: _action("group_chat_created"),
    pinnedMessage: _action("pinned_message"),
    invoice: _action("invoice"),
    successfulPayment: _action("successful_payment"),
    usersShared: _action("users_shared"),
    chatShared: _action("chat_shared"),
    webAppData: _action("web_app_data"),
    videoChatScheduled: _action("video_chat_scheduled"),
    videoChatStarted: _action("video_chat_started"),
    videoChatEnded: _action("video_chat_ended"),
    videoChatParticipantsInvited: _action("video_chat_participants_invited"),
    forumTopicCreated: _action("forum_topic_created"),
    forumTopicEdited: _action("forum_topic_edited"),
    forumTopicClosed: _action("forum_topic_closed"),
    forumTopicReopened: _action("forum_topic_reopened"),
    generalForumTopicHidden: _action("general_forum_topic_hidden"),
    generalForumTopicUnhidden: _action("general_forum_topic_unhidden"),
    giveawayCreated: _action("giveaway_created"),
    giveawayCompleted: _action("giveaway_completed"),
    giveawayWinners: _action("giveaway_winners"),
    boostAdded: _action("boost_added"),
    messageAutoDeleteTimerChanged: _action("message_auto_delete_timer_changed"),
    migrateToChatId: _action("migrate_to_chat_id"),
    migrateFromChatId: _action("migrate_from_chat_id"),
    passportData: _action("passport_data"),
    proximityAlertTriggered: _action("proximity_alert_triggered"),
    writeAccessAllowed: _action("write_access_allowed")
});