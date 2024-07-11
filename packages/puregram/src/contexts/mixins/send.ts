import * as Methods from '../../generated/methods'

import type { Optional } from '../../types/types'
import { Poll } from '../../common/structures'

import type { tSendMethods } from '../../types/send-media'

import { MessageContext } from '../message'
import { Context } from '../context'

interface SendMixinMetadata {
  get chatId(): number
  get senderId(): number | undefined
}

/** This object represents a mixin which can invoke `chatId`/`senderId`-dependent methods */
class SendMixin {
  payload!: Record<string, any>

  /** Sends message to current chat */
  async send (
    text: Methods.SendMessageParams['text'],
    params?: Optional<Methods.SendMessageParams, 'chat_id' | 'text'>
  ) {
    const response = await this.telegram.api.sendMessage({
      chat_id: this.chatId || this.senderId || 0,
      business_connection_id: this.payload.business_connection_id,
      text,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends photo to current chat */
  async sendPhoto (
    photo: Methods.SendPhotoParams['photo'],
    params?: Optional<Methods.SendPhotoParams, 'chat_id' | 'photo'>
  ) {
    const response = await this.telegram.api.sendPhoto({
      chat_id: this.chatId || this.senderId || 0,
      business_connection_id: this.payload.business_connection_id,
      photo,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends document to current chat */
  async sendDocument (
    document: Methods.SendDocumentParams['document'],
    params?: Optional<Methods.SendDocumentParams, 'chat_id' | 'document'>
  ) {
    const response = await this.telegram.api.sendDocument({
      chat_id: this.chatId || this.senderId || 0,
      business_connection_id: this.payload.business_connection_id,
      document,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends audio to current chat */
  async sendAudio (
    audio: Methods.SendAudioParams['audio'],
    params?: Optional<Methods.SendAudioParams, 'chat_id' | 'audio'>
  ) {
    const response = await this.telegram.api.sendAudio({
      chat_id: this.chatId || this.senderId || 0,
      business_connection_id: this.payload.business_connection_id,
      audio,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends video to current chat */
  async sendVideo (
    video: Methods.SendVideoParams['video'],
    params?: Optional<Methods.SendVideoParams, 'chat_id' | 'video'>
  ) {
    const response = await this.telegram.api.sendVideo({
      chat_id: this.chatId || this.senderId || 0,
      business_connection_id: this.payload.business_connection_id,
      video,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends animation to current chat */
  async sendAnimation (
    animation: Methods.SendAnimationParams['animation'],
    params?: Optional<Methods.SendAnimationParams, 'chat_id' | 'animation'>
  ) {
    const response = await this.telegram.api.sendAnimation({
      chat_id: this.chatId || this.senderId || 0,
      business_connection_id: this.payload.business_connection_id,
      animation,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends video note to current chat */
  async sendVideoNote (
    videoNote: Methods.SendVideoNoteParams['video_note'],
    params?: Optional<Methods.SendVideoNoteParams, 'chat_id' | 'video_note'>
  ) {
    const response = await this.telegram.api.sendVideoNote({
      chat_id: this.chatId || this.senderId || 0,
      business_connection_id: this.payload.business_connection_id,
      video_note: videoNote,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends voice to current chat */
  async sendVoice (
    voice: Methods.SendVoiceParams['voice'],
    params?: Optional<Methods.SendVoiceParams, 'chat_id' | 'voice'>
  ) {
    const response = await this.telegram.api.sendVoice({
      chat_id: this.chatId || this.senderId || 0,
      business_connection_id: this.payload.business_connection_id,
      voice,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends location to current chat */
  async sendLocation (
    latitude: number,
    longitude: number,
    params?: Optional<Methods.SendLocationParams, 'chat_id' | 'latitude' | 'longitude'>
  ) {
    const response = await this.telegram.api.sendLocation({
      chat_id: this.chatId || this.senderId || 0,
      business_connection_id: this.payload.business_connection_id,
      latitude,
      longitude,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends invoice to current user */
  async sendInvoice (params: Optional<Methods.SendInvoiceParams, 'chat_id'>) {
    const response = await this.telegram.api.sendInvoice({
      chat_id: this.chatId || this.senderId || 0,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends venue to current chat */
  async sendVenue (params: Optional<Methods.SendVenueParams, 'chat_id'>) {
    const response = await this.telegram.api.sendVenue({
      chat_id: this.chatId || this.senderId || 0,
      business_connection_id: this.payload.business_connection_id,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends contact to current chat */
  async sendContact (params: Optional<Methods.SendContactParams, 'chat_id'>) {
    const response = await this.telegram.api.sendContact({
      chat_id: this.chatId || this.senderId || 0,
      business_connection_id: this.payload.business_connection_id,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends poll to current chat */
  async sendPoll (params: Optional<Methods.SendPollParams, 'chat_id'>) {
    const response = await this.telegram.api.sendPoll({
      chat_id: this.chatId || this.senderId || 0,
      business_connection_id: this.payload.business_connection_id,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends sticker */
  async sendSticker (
    sticker: Methods.SendStickerParams['sticker'],
    params?: Optional<Methods.SendStickerParams, 'sticker' | 'chat_id'>
  ) {
    const response = await this.telegram.api.sendSticker({
      chat_id: this.chatId || this.senderId || 0,
      business_connection_id: this.payload.business_connection_id,
      sticker,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Stops poll in current chat */
  async stopPoll (
    messageId: number,
    params?: Partial<Methods.StopPollParams>
  ) {
    const response = await this.telegram.api.stopPoll({
      chat_id: this.chatId || this.senderId || 0,
      message_id: messageId,
      ...params
    })

    return new Poll(response)
  }

  /** Sends chat action to current chat */
  sendChatAction (
    action: Methods.SendChatActionParams['action'],
    params: Optional<Methods.SendChatActionParams, 'chat_id' | 'action'> = {}
  ) {
    return this.telegram.api.sendChatAction({
      chat_id: this.chatId || this.senderId || 0,
      business_connection_id: this.payload.business_connection_id,
      action,
      ...params
    })
  }

  /** Sends dice */
  async sendDice (
    emoji: Methods.SendDiceParams['emoji'],
    params?: Partial<Methods.SendDiceParams>
  ) {
    const response = await this.telegram.api.sendDice({
      chat_id: this.chatId || this.senderId || 0,
      business_connection_id: this.payload.business_connection_id,
      emoji,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends media group to current chat */
  async sendMediaGroup (
    mediaGroup: Methods.SendMediaGroupParams['media'],
    params?: Optional<Methods.SendMediaGroupParams, 'chat_id' | 'media'>
  ) {
    const response = await this.telegram.api.sendMediaGroup({
      chat_id: this.chatId || this.senderId || 0,
      business_connection_id: this.payload.business_connection_id,
      media: mediaGroup,
      ...params
    })

    return response.map(message => new MessageContext({
      telegram: this.telegram,
      payload: message
    }))
  }

  /**
   * Automatically uses correct media method to send media
   *
   * @example
   * ```js
   * context.sendMedia({
   *   type: 'photo',
   *   photo: MediaSource.path('./image.png'),
   *   caption: 'good image yes yes'
   * })
   * ```
   */
  sendMedia<T extends string>(query: { type: T } & tSendMethods): ReturnType<
    T extends 'animation' ? typeof this.sendAnimation :
    T extends 'audio' ? typeof this.sendAudio :
    T extends 'document' ? typeof this.sendDocument :
    T extends 'photo' ? typeof this.sendPhoto :
    T extends 'sticker' ? typeof this.sendSticker :
    T extends 'video_note' ? typeof this.sendVideoNote :
    T extends 'video' ? typeof this.sendVideo :
    T extends 'voice' ? typeof this.sendVoice :
    () => never
  >

  sendMedia<T extends { type: string }>(media: T): ReturnType<
    T extends { type: 'animation' } ? typeof this.sendAnimation :
    T extends { type: 'audio' } ? typeof this.sendAudio :
    T extends { type: 'document' } ? typeof this.sendDocument :
    T extends { type: 'photo' } ? typeof this.sendPhoto :
    T extends { type: 'sticker' } ? typeof this.sendSticker :
    T extends { type: 'video_note' } ? typeof this.sendVideoNote :
    T extends { type: 'video' } ? typeof this.sendVideo :
    T extends { type: 'voice' } ? typeof this.sendVoice :
    () => never
  >

  sendMedia (query: tSendMethods) {
    // INFO: kind of a hack for interoperability between TelegramInputMedia objects and sendMedia

    if ('media' in query) {
      query[query.type] = query.media

      delete query.media
    }

    if (query.type === 'animation') {
      return this.sendAnimation(query.animation, query)
    }

    if (query.type === 'audio') {
      return this.sendAudio(query.audio, query)
    }

    if (query.type === 'document') {
      return this.sendDocument(query.document, query)
    }

    if (query.type === 'photo') {
      return this.sendPhoto(query.photo, query)
    }

    if (query.type === 'sticker') {
      return this.sendSticker(query.sticker, query)
    }

    if (query.type === 'video_note') {
      return this.sendVideoNote(query.video_note, query)
    }

    if (query.type === 'video') {
      return this.sendVideo(query.video, query)
    }

    if (query.type === 'voice') {
      return this.sendVoice(query.voice, query)
    }

    // @ts-expect-error impossible type
    throw new TypeError(`[sendMedia] unhandled media type ${query.type}`)
  }

  /** Returns chat boosts by the user */
  getChatBoosts (userId: number) {
    return this.telegram.api.getUserChatBoosts({
      chat_id: this.chatId || this.senderId || 0,
      user_id: userId
    })
  }
}

interface SendMixin extends Context, SendMixinMetadata { }

export { SendMixin }
