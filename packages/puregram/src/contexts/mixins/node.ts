import * as Interfaces from '../../generated/telegram-interfaces'
import * as Methods from '../../generated/methods'

import { MediaInput } from '../../media-source'
import { Optional } from '../../types/types'

import { Context } from '../context'
import { SendMixin } from './send'
import { MessageContext } from '../message'

interface NodeMixinMetadata {
  get id(): number
}

/** This object represents a context which has `id` field and can invoke `id`-dependent methods */
class NodeMixin {
  /** Replies to current message */
  reply(
    text: string,
    params?: Optional<Methods.SendMessageParams, 'chat_id' | 'text'>
  ) {
    return this.send(text, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with photo */
  replyWithPhoto(
    photo: MediaInput,
    params?: Optional<Methods.SendPhotoParams, 'chat_id' | 'photo'>
  ) {
    return this.sendPhoto(photo, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with document */
  replyWithDocument(
    document: MediaInput,
    params?: Optional<Methods.SendDocumentParams, 'chat_id' | 'document'>
  ) {
    return this.sendDocument(document, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with audio */
  replyWithAudio(
    audio: MediaInput,
    params?: Optional<Methods.SendAudioParams, 'chat_id' | 'audio'>
  ) {
    return this.sendAudio(audio, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with video */
  replyWithVideo(
    video: MediaInput,
    params?: Optional<Methods.SendVideoParams, 'chat_id' | 'video'>
  ) {
    return this.sendVideo(video, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with animation */
  replyWithAnimation(
    animation: MediaInput,
    params?: Optional<Methods.SendAnimationParams, 'chat_id' | 'animation'>
  ) {
    return this.sendAnimation(animation, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with video note */
  replyWithVideoNote(
    videoNote: MediaInput,
    params?: Optional<Methods.SendVideoNoteParams, 'chat_id' | 'video_note'>
  ) {
    return this.sendVideoNote(videoNote, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with voice */
  replyWithVoice(
    voice: MediaInput,
    params?: Optional<Methods.SendVoiceParams, 'chat_id'>
  ) {
    return this.sendVoice(voice, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with media group */
  replyWithMediaGroup(
    mediaGroup: Methods.SendMediaGroupParams['media'],
    params?: Optional<Methods.SendMediaGroupParams, 'chat_id' | 'media'>
  ) {
    return this.sendMediaGroup(mediaGroup, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with location */
  replyWithLocation(
    latitude: number,
    longitude: number,
    params?: Optional<Methods.SendLocationParams, 'chat_id' | 'latitude' | 'longitude'>
  ) {
    return this.sendLocation(latitude, longitude, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with venue */
  replyWithVenue(params: Optional<Methods.SendVenueParams, 'chat_id'>) {
    return this.sendVenue({
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with contact */
  replyWithContact(params: Optional<Methods.SendContactParams, 'chat_id'>) {
    return this.sendContact({
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with poll */
  replyWithPoll(params: Optional<Methods.SendPollParams, 'chat_id'>) {
    return this.sendPoll({
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with sticker */
  replyWithSticker(
    sticker: MediaInput,
    params: Optional<Methods.SendStickerParams, 'chat_id'>
  ) {
    return this.sendSticker(sticker, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  replyWithDice(
    emoji: Methods.SendDiceParams['emoji'],
    params?: Partial<Methods.SendDiceParams>
  ) {
    return this.sendDice(emoji, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Deletes current message */
  deleteMessage() {
    return this.telegram.api.deleteMessage({
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id
    })
  }

  /** Edits current message live location */
  async editMessageLiveLocation(
    params: Methods.EditMessageLiveLocationParams
  ) {
    const response = await this.telegram.api.editMessageLiveLocation({
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id,
      ...params
    })

    if (response === true) {
      return true
    }

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Stops current message live location */
  async stopMessageLiveLocation(
    params?: Methods.StopMessageLiveLocationParams
  ) {
    const response = await this.telegram.api.stopMessageLiveLocation({
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id,
      ...params
    })

    if (response === true) {
      return true
    }

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Edits current message text */
  async editMessageText(
    text: string,
    params?: Partial<Methods.EditMessageTextParams>
  ) {
    const response = await this.telegram.api.editMessageText({
      ...params,
      text,
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id
    })

    if (response === true) {
      return true
    }

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Edits current message caption */
  async editMessageCaption(
    caption: string,
    params?: Partial<Methods.EditMessageCaptionParams>
  ) {
    const response = await this.telegram.api.editMessageCaption({
      ...params,
      caption,
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id
    })

    if (response === true) {
      return true
    }

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Edits current message media */
  async editMessageMedia(
    media: Interfaces.TelegramInputMedia,
    params?: Partial<Methods.EditMessageMediaParams>
  ) {
    const response = await this.telegram.api.editMessageMedia({
      ...params,
      media,
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id
    })

    if (response === true) {
      return true
    }

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Edits current message reply markup */
  async editMessageReplyMarkup(
    replyMarkup: Interfaces.TelegramInlineKeyboardMarkup,
    params?: Partial<Methods.EditMessageReplyMarkupParams>
  ) {
    const response = await this.telegram.api.editMessageReplyMarkup({
      ...params,
      reply_markup: replyMarkup,
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id
    })

    if (response === true) {
      return true
    }

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }
}

interface NodeMixin extends Context, NodeMixinMetadata, SendMixin { }

export { NodeMixin }
