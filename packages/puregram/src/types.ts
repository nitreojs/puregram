import { Readable } from 'stream';

import { TelegramUpdate, TelegramMessageEntity } from './interfaces';
import { ApiMethods } from './api-methods';
import { MessageEntity } from './common/structures/message-entity';

export type AllowArray<T> = T | T[];

export type ParseMode = 'HTML' | 'Markdown' | 'MarkdownV2';
export type ChatType = 'private' | 'group' | 'supergroup' | 'channel';
export type EntityType = 'mention' | 'hashtag' | 'cashtag' | 'bot_command' | 'url' | 'email' | 'phone_number' | 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'pre' | 'text_link' | 'text_mention';
export type MaskPositionPoint = 'forehead' | 'eyes' | 'mouth' | 'chin';
export type DiceEmoji = '🎲' | '🎯' | '🏀' | '🎰' | '⚽️' | '🎳';
export type PollType = 'regular' | 'quiz';
export type EncryptedPassportElementType = 'personal_details' | 'passport' | 'driver_license' | 'identity_card' | 'internal_passport' | 'address' | 'utility_bill' | 'bank_statement' | 'rental_agreement' | 'passport_registration' | 'temporary_registration' | 'phone_number' | 'email';
export type MessageEventName = 'new_chat_members' | 'left_chat_member' | 'new_chat_title' | 'new_chat_photo' | 'delete_chat_photo' | 'group_chat_created' | 'supergroup_chat_created' | 'channel_chat_created' | 'migrate_to_chat_id' | 'migrate_from_chat_id' | 'pinned_message' | 'invoice' | 'successful_payment' | 'location' | 'message_auto_delete_timer_changed' | 'voice_chat_started' | 'voice_chat_ended' | 'voice_chat_participants_invited';
export type UpdateName = Exclude<keyof TelegramUpdate, 'update_id'> | MessageEventName;
export type AttachmentType = 'animation' | 'audio' | 'document' | 'photo' | 'sticker' | 'video' | 'video_note' | 'voice';
export type MediaAttachmentType = AttachmentType | 'media' | 'png_sticker' | 'tgs_sticker' | 'thumb';
export type Constructor<T = {}> = new (...args: any[]) => T;
export type InputMediaType = 'photo' | 'video' | 'animation' | 'audio' | 'document';
export type TelegramInputFile = string | Record<string, any> | Buffer | Readable;
export type ChatAction = 'typing' | 'upload_photo' | 'record_video' | 'upload_video' | 'record_audio' | 'upload_audio' | 'upload_document' | 'find_location' | 'record_video_note' | 'upload_video_note';
export type ChatMemberStatus = 'creator' | 'administrator' | 'member' | 'restricted' | 'left' | 'kicked';
export type InlineQueryType = 'article' | 'photo' | 'gif' | 'mpeg4_gif' | 'video' | 'audio' | 'voice' | 'document' | 'location' | 'venue' | 'contact' | 'game' | 'sticker';
export type PassportElementSource = 'data' | 'front_side' | 'reverse_side' | 'selfie' | 'file' | 'files' | 'translation_file' | 'translation_files' | 'unspecified';
export type ApiMethod = keyof ApiMethods;
export type MessageEntities = (TelegramMessageEntity | MessageEntity)[];

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
