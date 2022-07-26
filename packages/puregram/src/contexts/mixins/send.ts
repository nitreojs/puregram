import * as Interfaces from '../../generated/telegram-interfaces'
import * as Methods from '../../generated/methods'

import { MediaInput } from '../../common/media-source'
import { Optional } from '../../types/types'
import { Poll } from '../../common/structures'

import { MessageContext } from '../message'
import { Context } from '../context'

interface SendMixinMetadata {
  get chatId(): number
  get senderId(): number | undefined
}

/** This object represents a mixin which can invoke `chatId`/`senderId`-dependent methods */
class SendMixin {
  /** Sends message to current chat */
  async send (
    text: string,
    params?: Optional<Methods.SendMessageParams, 'chat_id' | 'text'>
  ) {
    const response = await this.telegram.api.sendMessage({
      chat_id: this.chatId || this.senderId || 0,
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
    photo: MediaInput,
    params?: Optional<Methods.SendPhotoParams, 'chat_id' | 'photo'>
  ) {
    const response = await this.telegram.api.sendPhoto({
      chat_id: this.chatId || this.senderId || 0,
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
    document: MediaInput,
    params?: Optional<Methods.SendDocumentParams, 'chat_id' | 'document'>
  ) {
    const response = await this.telegram.api.sendDocument({
      chat_id: this.chatId || this.senderId || 0,
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
    audio: MediaInput,
    params?: Optional<Methods.SendAudioParams, 'chat_id' | 'audio'>
  ) {
    const response = await this.telegram.api.sendAudio({
      chat_id: this.chatId || this.senderId || 0,
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
    video: MediaInput,
    params?: Optional<Methods.SendVideoParams, 'chat_id' | 'video'>
  ) {
    const response = await this.telegram.api.sendVideo({
      chat_id: this.chatId || this.senderId || 0,
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
    animation: MediaInput,
    params?: Optional<Methods.SendAnimationParams, 'chat_id' | 'animation'>
  ) {
    const response = await this.telegram.api.sendAnimation({
      chat_id: this.chatId || this.senderId || 0,
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
    videoNote: MediaInput,
    params?: Optional<Methods.SendVideoNoteParams, 'chat_id' | 'video_note'>
  ) {
    const response = await this.telegram.api.sendVideoNote({
      chat_id: this.chatId || this.senderId || 0,
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
    voice: MediaInput,
    params?: Optional<Methods.SendVoiceParams, 'chat_id' | 'voice'>
  ) {
    const response = await this.telegram.api.sendVoice({
      chat_id: this.chatId || this.senderId || 0,
      voice,
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
      media: mediaGroup,
      ...params
    })

    return response.map(
      (message: Interfaces.TelegramMessage) => new MessageContext({
        telegram: this.telegram,
        payload: message
      })
    )
  }

  /** Sends location to current chat */
  async sendLocation (
    latitude: number,
    longitude: number,
    params?: Optional<Methods.SendLocationParams, 'chat_id' | 'latitude' | 'longitude'>
  ) {
    const response = await this.telegram.api.sendLocation({
      chat_id: this.chatId || this.senderId || 0,
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
  async sendInvoice (
    params: Optional<Methods.SendInvoiceParams, 'chat_id'>
  ) {
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
      action,
      ...params
    })
  }

  /** Sends sticker */
  async sendSticker (
    sticker: MediaInput,
    params?: Optional<Methods.SendStickerParams, 'sticker' | 'chat_id'>
  ) {
    const response = await this.telegram.api.sendSticker({
      chat_id: this.chatId || this.senderId || 0,
      sticker,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends dice */
  async sendDice (
    emoji: Methods.SendDiceParams['emoji'],
    params?: Partial<Methods.SendDiceParams>
  ) {
    const response = await this.telegram.api.sendDice({
      chat_id: this.chatId || this.senderId || 0,
      emoji,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }
}

interface SendMixin extends Context, SendMixinMetadata { }

export { SendMixin }
