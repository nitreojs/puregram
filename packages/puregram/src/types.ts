import { TelegramUpdate } from './telegram-interfaces';
import { ApiMethods } from './api-methods';

export type AllowArray<T> = T | T[];

export type MessageEventName = 'new_chat_members' | 'left_chat_member' | 'new_chat_title' | 'new_chat_photo' | 'delete_chat_photo' | 'group_chat_created' | 'supergroup_chat_created' | 'channel_chat_created' | 'migrate_to_chat_id' | 'migrate_from_chat_id' | 'pinned_message' | 'invoice' | 'successful_payment' | 'location' | 'message_auto_delete_timer_changed' | 'voice_chat_scheduled' | 'voice_chat_started' | 'voice_chat_ended' | 'voice_chat_participants_invited';
export type UpdateName = Exclude<keyof TelegramUpdate, 'update_id'> | MessageEventName;
export type AttachmentType = 'animation' | 'audio' | 'document' | 'photo' | 'sticker' | 'video' | 'video_note' | 'voice';
export type MediaAttachmentType = AttachmentType | 'media' | 'png_sticker' | 'tgs_sticker' | 'thumb';
export type Constructor<T = {}> = new (...args: any[]) => T;
export type ApiMethod = keyof ApiMethods;

// https://stackoverflow.com/questions/58216298/how-to-omit-keystring-any-from-a-type-in-typescript
// Used when you have { foo: string; bar: number; [key: string]: any }-like interface
// but you need to make `foo` non-required parameter and ignore [key: string]: any
export type KnownKeys<T> = {
  [K in keyof T]: string extends K
    ? never
    : number extends K
      ? never
      : K
} extends { [_ in keyof T]: infer U }
  ? U
  : never;

export type Optional<T, K extends keyof T> = Pick<T, Exclude<KnownKeys<T>, K>> & Partial<Pick<T, K>>;
