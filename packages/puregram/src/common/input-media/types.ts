import * as Methods from '../../generated/methods'

import { Optional } from '../../types/types'

export type NonMediaParams = 'chat_id' | 'message_thread_id' | 'disable_notification' | 'protect_content' | 'reply_to_message_id' | 'allow_sending_without_reply' | 'reply_markup'

type InputMediaParams<T> = Exclude<T, NonMediaParams>

type Replace<T, K extends keyof T, V extends string> = Omit<T, K> & { [P in V]: T[K] }

export type InputMediaStickerOriginal = Optional<InputMediaParams<Methods.SendStickerParams>, 'chat_id'>
export type InputMediaVideoNoteOriginal = Optional<InputMediaParams<Methods.SendVideoNoteParams>, 'chat_id'>
export type InputMediaVoiceOriginal = Optional<InputMediaParams<Methods.SendVoiceParams>, 'chat_id'>

export type InputMediaSticker = Replace<InputMediaStickerOriginal, 'sticker', 'media'>
export type InputMediaVideoNote = Replace<InputMediaVideoNoteOriginal, 'video_note', 'media'>
export type InputMediaVoice = Replace<InputMediaVoiceOriginal, 'voice', 'media'>
