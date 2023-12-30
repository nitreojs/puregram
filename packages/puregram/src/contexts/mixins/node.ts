import * as Interfaces from '../../generated/telegram-interfaces'
import * as Methods from '../../generated/methods'

import { InlineKeyboard, InlineKeyboardBuilder } from '../../common/keyboards'
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
    text: Methods.SendMessageParams['text'],
    params?: Optional<Methods.SendMessageParams, 'chat_id' | 'text'>
  ) {
    return this.send(text, {
      reply_parameters: {
        message_id: this.id
      },
      ...params
    })
  }

  /** Replies to current message with photo */
  replyWithPhoto (
    photo: Methods.SendPhotoParams['photo'],
    params?: Optional<Methods.SendPhotoParams, 'chat_id' | 'photo'>
  ) {
    return this.sendPhoto(photo, {
      reply_parameters: {
        message_id: this.id
      },
      ...params
    })
  }

  /** Replies to current message with document */
  replyWithDocument (
    document: Methods.SendDocumentParams['document'],
    params?: Optional<Methods.SendDocumentParams, 'chat_id' | 'document'>
  ) {
    return this.sendDocument(document, {
      reply_parameters: {
        message_id: this.id
      },
      ...params
    })
  }

  /** Replies to current message with audio */
  replyWithAudio (
    audio: Methods.SendAudioParams['audio'],
    params?: Optional<Methods.SendAudioParams, 'chat_id' | 'audio'>
  ) {
    return this.sendAudio(audio, {
      reply_parameters: {
        message_id: this.id
      },
      ...params
    })
  }

  /** Replies to current message with video */
  replyWithVideo (
    video: Methods.SendVideoParams['video'],
    params?: Optional<Methods.SendVideoParams, 'chat_id' | 'video'>
  ) {
    return this.sendVideo(video, {
      reply_parameters: {
        message_id: this.id
      },
      ...params
    })
  }

  /** Replies to current message with animation */
  replyWithAnimation (
    animation: Methods.SendAnimationParams['animation'],
    params?: Optional<Methods.SendAnimationParams, 'chat_id' | 'animation'>
  ) {
    return this.sendAnimation(animation, {
      reply_parameters: {
        message_id: this.id
      },
      ...params
    })
  }

  /** Replies to current message with video note */
  replyWithVideoNote (
    videoNote: Methods.SendVideoNoteParams['video_note'],
    params?: Optional<Methods.SendVideoNoteParams, 'chat_id' | 'video_note'>
  ) {
    return this.sendVideoNote(videoNote, {
      reply_parameters: {
        message_id: this.id
      },
      ...params
    })
  }

  /** Replies to current message with voice */
  replyWithVoice (
    voice: Methods.SendVoiceParams['voice'],
    params?: Optional<Methods.SendVoiceParams, 'chat_id' | 'voice'>
  ) {
    return this.sendVoice(voice, {
      reply_parameters: {
        message_id: this.id
      },
      ...params
    })
  }

  /** Replies to current message with media group */
  replyWithMediaGroup (
    mediaGroup: Methods.SendMediaGroupParams['media'],
    params?: Optional<Methods.SendMediaGroupParams, 'chat_id' | 'media'>
  ) {
    return this.sendMediaGroup(mediaGroup, {
      reply_parameters: {
        message_id: this.id
      },
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
      reply_parameters: {
        message_id: this.id
      },
      ...params
    })
  }

  /** Replies to current message with invoice */
  replyWithInvoice (params: Optional<Methods.SendInvoiceParams, 'chat_id'>) {
    return this.sendInvoice({
      reply_parameters: {
        message_id: this.id
      },
      ...params
    })
  }

  /** Replies to current message with venue */
  replyWithVenue (params: Optional<Methods.SendVenueParams, 'chat_id'>) {
    return this.sendVenue({
      reply_parameters: {
        message_id: this.id
      },
      ...params
    })
  }

  /** Replies to current message with contact */
  replyWithContact (params: Optional<Methods.SendContactParams, 'chat_id'>) {
    return this.sendContact({
      reply_parameters: {
        message_id: this.id
      },
      ...params
    })
  }

  /** Replies to current message with poll */
  replyWithPoll (params: Optional<Methods.SendPollParams, 'chat_id'>) {
    return this.sendPoll({
      reply_parameters: {
        message_id: this.id
      },
      ...params
    })
  }

  /** Replies to current message with sticker */
  replyWithSticker (
    sticker: Methods.SendStickerParams['sticker'],
    params: Optional<Methods.SendStickerParams, 'chat_id'>
  ) {
    return this.sendSticker(sticker, {
      reply_parameters: {
        message_id: this.id
      },
      ...params
    })
  }

  /** Replies to current message with a dice */
  replyWithDice (
    emoji: Methods.SendDiceParams['emoji'],
    params?: Partial<Methods.SendDiceParams>
  ) {
    return this.sendDice(emoji, {
      reply_parameters: {
        message_id: this.id
      },
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
  async editMessageLiveLocation (params: Methods.EditMessageLiveLocationParams) {
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
  async stopMessageLiveLocation (params?: Methods.StopMessageLiveLocationParams) {
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
    text: Methods.EditMessageTextParams['text'],
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
    caption: NonNullable<Methods.EditMessageCaptionParams['caption']>,
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
    media: Methods.EditMessageMediaParams['media'],
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
  async copy (params: Optional<Methods.CopyMessageParams, 'chat_id' | 'from_chat_id' | 'message_id'> = {}) {
    const response = await this.telegram.api.copyMessage({
      chat_id: this.chatId || this.senderId || 0,
      from_chat_id: this.chatId || 0,
      message_id: this.id,
      ...params
    })

    return new MessageId(response)
  }

  /** Forwards current message [into other chat if `chatId` is provided] */
  async forward (params: Optional<Methods.ForwardMessageParams, 'chat_id' | 'from_chat_id' | 'message_id'> = {}) {
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

  /** Sets a reaction on a message */
  setReaction (reaction: Interfaces.TelegramReactionTypeEmoji['emoji'] | Interfaces.TelegramReactionType, params: Optional<Methods.SetMessageReactionParams, 'chat_id' | 'message_id'> = {}) {
    if (typeof reaction === 'string') {
      reaction = {
        type: 'emoji',
        emoji: reaction
      }
    }

    return this.telegram.api.setMessageReaction({
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id,
      reaction: [reaction],
      ...params
    })
  }

  /** Sets multiple amount of reactions on a message */
  setReactions (rawReactions: (Interfaces.TelegramReactionTypeEmoji['emoji'] | Interfaces.TelegramReactionType)[], params: Optional<Methods.SetMessageReactionParams, 'chat_id' | 'message_id'> = {}) {
    const reactions = rawReactions.map(r => typeof r === 'string' ? { type: 'emoji', emoji: r } as Interfaces.TelegramReactionTypeEmoji : r)

    return this.telegram.api.setMessageReaction({
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id,
      reaction: reactions,
      ...params
    })
  }

  /** Clears reactions from the message */
  clearReactions (params: Optional<Methods.SetMessageReactionParams, 'chat_id' | 'message_id'> = {}) {
    return this.telegram.api.deleteMessageReaction({
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id,
      ...params
    })
  }
}

interface NodeMixin extends Context, NodeMixinMetadata, SendMixin { }

export { NodeMixin }
