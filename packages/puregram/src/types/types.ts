import type { TelegramUpdate, ApiMethods } from '../generated'

export type MaybeArray<T> = T | T[]
export type MaybePromise<T> = T | Promise<T>

/** Removes `[key: string]: any;` from interface */
export type Known<T> = {
  [K in keyof T as (string extends K ? never : number extends K ? never : K)]: T[K]
}

// THIS PART OF FILE IS AUTO-GENERATED!
// SOURCE: scripts/generate-constants
// @autogenerated generate-constants-events-name start
export type MessageEventName = 'new_chat_members' | 'left_chat_member' | 'new_chat_title' | 'new_chat_photo' | 'delete_chat_photo' | 'group_chat_created' | 'message_auto_delete_timer_changed' | 'migrate_to_chat_id' | 'migrate_from_chat_id' | 'pinned_message' | 'invoice' | 'successful_payment' | 'users_shared' | 'chat_shared' | 'proximity_alert_triggered' | 'write_access_allowed' | 'forum_topic_created' | 'forum_topic_edited' | 'forum_topic_closed' | 'forum_topic_reopened' | 'general_forum_topic_hidden' | 'general_forum_topic_unhidden' | 'video_chat_scheduled' | 'video_chat_started' | 'video_chat_ended' | 'video_chat_participants_invited' | 'web_app_data' | 'location' | 'passport_data' | 'giveaway_created' | 'giveaway_completed' | 'giveaway_winners' | 'chat_boost' | 'removed_chat_boost' | 'boost_added'
// @autogenerated generate-constants-events-name end

export type CustomEventName = 'service_message'
export type UpdateName = Exclude<keyof Known<TelegramUpdate>, 'update_id'> | MessageEventName | CustomEventName
export type AttachmentType = 'animation' | 'audio' | 'document' | 'photo' | 'sticker' | 'video' | 'video_note' | 'voice' | 'contact' | 'poll' | 'venue' | 'location' | 'story'
export type MediaAttachmentType = AttachmentType | 'media' | 'png_sticker' | 'tgs_sticker' | 'thumb'
export type Constructor<T = {}> = new (...args: any[]) => T
export type ApiMethod = keyof Known<ApiMethods>

/** Might be used to reveal actual object's type */
export type Id<T> = T extends infer O
  ? { [K in keyof O]: O[K] }
  : never

export type Optional<T, K extends keyof Known<T>> =
  /** We pick every field but `K` and leave them as is */
  & Pick<Known<T>, Exclude<keyof Known<T>, K>>
  /** Then, we take our `K` fields and mark them as optional */
  & { [P in K]?: Known<T>[P] }
  /** Lastly, we add `[key: string]: any;` */
  & { [key: string]: any }

// https://github.com/grammyjs/grammY/blob/b8ac3d65bad6ed6a63a82c8bd8c642406c95532c/src/composer.ts#L8
/** Permits `string` but gives hints */
export type SoftString<S extends string> = (string & {}) | S

/** Like `Required<T>` but for specified keys of `T` */
export type Require<O, K extends keyof O> = { [P in K]-?: NonNullable<O[P]> }

/** Like `Require<O, K>` but it sets `V` as the value for `K` values */
export type RequireValue<O, K extends keyof O, V> = Omit<O, K> & { [P in K]-?: V }

/** Creates a 'one of' situational record */
export type OneOf<T, K extends keyof T = keyof T> = Id<{
  [P in K]-?: Pick<Known<T>, Exclude<keyof Known<T>, K>> & Required<Pick<T, P>>
}[K]>

/**
 * Represents any value that has `format` method and is generally able to be converted into a string.
 * Can be used for methods that allow passing `text: string` or `caption: string`
 */
export interface Formattable {
  format(): string
}

export type AvailableText = string | Formattable
