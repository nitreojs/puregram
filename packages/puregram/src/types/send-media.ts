import * as Methods from '../generated/methods'

import { Optional } from './types'

type id<T, I extends { chat_id: string | number }> = { type: T } & Optional<I, 'chat_id'>

export type tSendAnimation = id<'animation', Methods.SendAnimationParams>
export type tSendAudio = id<'audio', Methods.SendAudioParams>
export type tSendContact = id<'contact', Methods.SendContactParams>
export type tSendDocument = id<'document', Methods.SendDocumentParams>
export type tSendLocation = id<'location', Methods.SendLocationParams>
export type tSendPhoto = id<'photo', Methods.SendPhotoParams>
export type tSendPoll = id<'poll', Methods.SendPollParams>
export type tSendSticker = id<'sticker', Methods.SendStickerParams>
export type tSendVenue = id<'venue', Methods.SendVenueParams>
export type tSendVideoNote = id<'video_note', Methods.SendVideoNoteParams>

export type tSendMethods =
  | tSendAnimation
  | tSendAudio
  | tSendContact
  | tSendDocument
  | tSendLocation
  | tSendPhoto
  | tSendPoll
  | tSendSticker
  | tSendVenue
  | tSendVideoNote
