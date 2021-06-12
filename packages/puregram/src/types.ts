import { TelegramUpdate } from './telegram-interfaces';
import { ApiMethods } from './api-methods';

export type AllowArray<T> = T | T[];

export type MessageEventName = 'new_chat_members' | 'left_chat_member' | 'new_chat_title' | 'new_chat_photo' | 'delete_chat_photo' | 'group_chat_created' | 'supergroup_chat_created' | 'channel_chat_created' | 'migrate_to_chat_id' | 'migrate_from_chat_id' | 'pinned_message' | 'invoice' | 'successful_payment' | 'location' | 'message_auto_delete_timer_changed' | 'voice_chat_scheduled' | 'voice_chat_started' | 'voice_chat_ended' | 'voice_chat_participants_invited';
export type UpdateName = Exclude<keyof TelegramUpdate, 'update_id'> | MessageEventName;
export type AttachmentType = 'animation' | 'audio' | 'document' | 'photo' | 'sticker' | 'video' | 'video_note' | 'voice';
export type MediaAttachmentType = AttachmentType | 'media' | 'png_sticker' | 'tgs_sticker' | 'thumb';
export type Constructor<T = {}> = new (...args: any[]) => T;
export type ApiMethod = keyof ApiMethods;

/** Removes `[key: string]: any;` from interface */
export type Known<T> = {
  [K in keyof T as (string extends K ? never : number extends K ? never : K)]: T[K];
}

/** Might be used to reveal actual object's type */
export type Id<T> = T extends infer O
  ? { [K in keyof O]: O[K] }
  : never

export type Optional<T, K extends keyof Known<T>> =
  /** We pick every field but `K` and leave them as is */
  & Pick<Known<T>, Exclude<keyof Known<T>, K>>
  /** Then, we take our `K` fields and mark them as optional */
  & { [P in K]?: Known<T>[P]; }
  /** Lastly, we add `[key: string]: any;` */
  & { [key: string]: any; }
