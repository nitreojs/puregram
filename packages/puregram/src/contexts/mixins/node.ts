import * as Interfaces from '../../generated/telegram-interfaces'
import * as Methods from '../../generated/methods'

import { InlineKeyboard, InlineKeyboardBuilder } from '../../common/keyboards'
import { MediaInput } from '../../common/media-source'
import { MessageId } from '../../common/structures'
import { Optional } from '../../types/types'

import { Context } from '../context'
import { SendMixin } from './send'
import { MessageContext } from '../message'

interface NodeMixinMetadata {
  get id(): number
}

/** This object represents a mixin which has `id` field and can invoke `id`-dependent methods */
class NodeMixin {
  /** Replies to current message */
  reply (
    text: string,
    params?: Optional<Methods.SendMessageParams, 'chat_id' | 'text'>
  ) {
    return this.send(text, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with photo */
  replyWithPhoto (
    photo: MediaInput,
    params?: Optional<Methods.SendPhotoParams, 'chat_id' | 'photo'>
  ) {
    return this.sendPhoto(photo, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with document */
  replyWithDocument (
    document: MediaInput,
    params?: Optional<Methods.SendDocumentParams, 'chat_id' | 'document'>
  ) {
    return this.sendDocument(document, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with audio */
  replyWithAudio (
    audio: MediaInput,
    params?: Optional<Methods.SendAudioParams, 'chat_id' | 'audio'>
  ) {
    return this.sendAudio(audio, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with video */
  replyWithVideo (
    video: MediaInput,
    params?: Optional<Methods.SendVideoParams, 'chat_id' | 'video'>
  ) {
    return this.sendVideo(video, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with animation */
  replyWithAnimation (
    animation: MediaInput,
    params?: Optional<Methods.SendAnimationParams, 'chat_id' | 'animation'>
  ) {
    return this.sendAnimation(animation, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with video note */
  replyWithVideoNote (
    videoNote: MediaInput,
    params?: Optional<Methods.SendVideoNoteParams, 'chat_id' | 'video_note'>
  ) {
    return this.sendVideoNote(videoNote, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with voice */
  replyWithVoice (
    voice: MediaInput,
    params?: Optional<Methods.SendVoiceParams, 'chat_id' | 'voice'>
  ) {
    return this.sendVoice(voice, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with media group */
  replyWithMediaGroup (
    mediaGroup: Methods.SendMediaGroupParams['media'],
    params?: Optional<Methods.SendMediaGroupParams, 'chat_id' | 'media'>
  ) {
    return this.sendMediaGroup(mediaGroup, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with location */
  replyWithLocation (
    latitude: number,
    longitude: number,
    params?: Optional<Methods.SendLocationParams, 'chat_id' | 'latitude' | 'longitude'>
  ) {
    return this.sendLocation(latitude, longitude, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with invoice */
  replyWithInvoice (params: Optional<Methods.SendInvoiceParams, 'chat_id'>) {
    return this.sendInvoice({
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with venue */
  replyWithVenue (params: Optional<Methods.SendVenueParams, 'chat_id'>) {
    return this.sendVenue({
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with contact */
  replyWithContact (params: Optional<Methods.SendContactParams, 'chat_id'>) {
    return this.sendContact({
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with poll */
  replyWithPoll (params: Optional<Methods.SendPollParams, 'chat_id'>) {
    return this.sendPoll({
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with sticker */
  replyWithSticker (
    sticker: MediaInput,
    params: Optional<Methods.SendStickerParams, 'chat_id'>
  ) {
    return this.sendSticker(sticker, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Replies to current message with a dice */
  replyWithDice (
    emoji: Methods.SendDiceParams['emoji'],
    params?: Partial<Methods.SendDiceParams>
  ) {
    return this.sendDice(emoji, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** @deprecated use `delete()` instead */
  deleteMessage (params?: Optional<Methods.DeleteMessageParams, 'chat_id' | 'message_id'>) {
    return this.delete(params)
  }

  /** Deletes current message */
  delete (params: Optional<Methods.DeleteMessageParams, 'chat_id' | 'message_id'> = {}) {
    return this.telegram.api.deleteMessage({
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id,
      ...params
    })
  }

  /** Edits current message live location */
  async editMessageLiveLocation (
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
  async stopMessageLiveLocation (
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
  async editMessageText (
    text: string,
    params?: Partial<Methods.EditMessageTextParams>
  ) {
    const response = await this.telegram.api.editMessageText({
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id,
      text,
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

  /** Edits current message caption */
  async editMessageCaption (
    caption: string,
    params?: Partial<Methods.EditMessageCaptionParams>
  ) {
    const response = await this.telegram.api.editMessageCaption({
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id,
      caption,
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

  /** Edits current message media */
  async editMessageMedia (
    media: Interfaces.TelegramInputMedia,
    params?: Partial<Methods.EditMessageMediaParams>
  ) {
    const response = await this.telegram.api.editMessageMedia({
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id,
      media,
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

  /** Edits current message reply markup */
  async editMessageReplyMarkup (
    replyMarkup: InlineKeyboard | InlineKeyboardBuilder | Interfaces.TelegramInlineKeyboardMarkup,
    params?: Partial<Methods.EditMessageReplyMarkupParams>
  ) {
    const response = await this.telegram.api.editMessageReplyMarkup({
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id,
      reply_markup: replyMarkup,
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

  /** Copies current message [into other chat if `chatId` is provided] */
  async copy (
    params: Optional<Methods.CopyMessageParams, 'chat_id' | 'from_chat_id' | 'message_id'> = {}
  ) {
    const response = await this.telegram.api.copyMessage({
      chat_id: this.chatId || this.senderId || 0,
      from_chat_id: this.chatId || 0,
      message_id: this.id,
      ...params
    })

    return new MessageId(response)
  }

  /** Forwards current message [into other chat if `chatId` is provided] */
  async forward (
    params: Optional<Methods.ForwardMessageParams, 'chat_id' | 'from_chat_id' | 'message_id'> = {}
  ) {
    const response = await this.telegram.api.forwardMessage({
      chat_id: this.chatId || this.senderId || 0,
      from_chat_id: this.chatId || 0,
      message_id: this.id,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }
}

interface NodeMixin extends Context, NodeMixinMetadata, SendMixin { }

export { NodeMixin }
