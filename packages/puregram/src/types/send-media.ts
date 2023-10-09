import * as Methods from '../generated/methods'

import { Optional } from './types'

type id<T, I extends { chat_id: string | number }> = { type: T } & Optional<I, 'chat_id'>

export type tSendAnimation = id<'animation', Methods.SendAnimationParams>
export type tSendAudio = id<'audio', Methods.SendAudioParams>
export type tSendDocument = id<'document', Methods.SendDocumentParams>
export type tSendPhoto = id<'photo', Methods.SendPhotoParams>
export type tSendSticker = id<'sticker', Methods.SendStickerParams>
export type tSendVideo = id<'video', Methods.SendVideoParams>
export type tSendVideoNote = id<'video_note', Methods.SendVideoNoteParams>
export type tSendVoice = id<'voice', Methods.SendVoiceParams>

export type tSendMethods =
  | tSendAnimation
  | tSendAudio
  | tSendDocument
  | tSendPhoto
  | tSendSticker
  | tSendVideo
  | tSendVideoNote
  | tSendVoice
