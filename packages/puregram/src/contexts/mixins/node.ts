import * as Interfaces from '../../generated/telegram-interfaces'
import * as Methods from '../../generated/methods'

import { InlineKeyboard, InlineKeyboardBuilder } from '../../common/keyboards'
import { MessageId } from '../../common/structures'
import { AvailableText, Known, MaybeArray, Optional } from '../../types/types'

import { Context } from '../context'
import { SendMixin } from './send'
import { MessageContext } from '../message'

interface NodeMixinMetadata {
  get id(): number
}

/** Construct a type that has `reply_parameters` `Partial` */
type WithPartialReplyParameters<T> =
  & Omit<Known<T>, 'reply_parameters'>
  & { reply_parameters?: Partial<Interfaces.TelegramReplyParameters> }
  & Record<string, any>

type WithQuote<T = {}> =
  & { quote: AvailableText }
  & T

/** This object represents a mixin which has `id` field and can invoke `id`-dependent methods */
class NodeMixin {
  /** Replies to current message */
  reply (
    text: Methods.SendMessageParams['text'],
    params: WithPartialReplyParameters<Optional<Methods.SendMessageParams, 'chat_id' | 'text'>> = {}
  ) {
    const { reply_parameters, ...rest } = params

    return this.send(text, {
      reply_parameters: {
        message_id: this.id,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with photo */
  replyWithPhoto (
    photo: Methods.SendPhotoParams['photo'],
    params: WithPartialReplyParameters<Optional<Methods.SendPhotoParams, 'chat_id' | 'photo'>> = {}
  ) {
    const { reply_parameters, ...rest } = params

    return this.sendPhoto(photo, {
      reply_parameters: {
        message_id: this.id,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with document */
  replyWithDocument (
    document: Methods.SendDocumentParams['document'],
    params: WithPartialReplyParameters<Optional<Methods.SendDocumentParams, 'chat_id' | 'document'>> = {}
  ) {
    const { reply_parameters, ...rest } = params

    return this.sendDocument(document, {
      reply_parameters: {
        message_id: this.id,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with audio */
  replyWithAudio (
    audio: Methods.SendAudioParams['audio'],
    params: WithPartialReplyParameters<Optional<Methods.SendAudioParams, 'chat_id' | 'audio'>> = {}
  ) {
    const { reply_parameters, ...rest } = params

    return this.sendAudio(audio, {
      reply_parameters: {
        message_id: this.id,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with video */
  replyWithVideo (
    video: Methods.SendVideoParams['video'],
    params: WithPartialReplyParameters<Optional<Methods.SendVideoParams, 'chat_id' | 'video'>> = {}
  ) {
    const { reply_parameters, ...rest } = params

    return this.sendVideo(video, {
      reply_parameters: {
        message_id: this.id,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with animation */
  replyWithAnimation (
    animation: Methods.SendAnimationParams['animation'],
    params: WithPartialReplyParameters<Optional<Methods.SendAnimationParams, 'chat_id' | 'animation'>> = {}
  ) {
    const { reply_parameters, ...rest } = params

    return this.sendAnimation(animation, {
      reply_parameters: {
        message_id: this.id,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with video note */
  replyWithVideoNote (
    videoNote: Methods.SendVideoNoteParams['video_note'],
    params: WithPartialReplyParameters<Optional<Methods.SendVideoNoteParams, 'chat_id' | 'video_note'>> = {}
  ) {
    const { reply_parameters, ...rest } = params

    return this.sendVideoNote(videoNote, {
      reply_parameters: {
        message_id: this.id,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with voice */
  replyWithVoice (
    voice: Methods.SendVoiceParams['voice'],
    params: WithPartialReplyParameters<Optional<Methods.SendVoiceParams, 'chat_id' | 'voice'>> = {}
  ) {
    const { reply_parameters, ...rest } = params

    return this.sendVoice(voice, {
      reply_parameters: {
        message_id: this.id,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with media group */
  replyWithMediaGroup (
    mediaGroup: Methods.SendMediaGroupParams['media'],
    params: WithPartialReplyParameters<Optional<Methods.SendMediaGroupParams, 'chat_id' | 'media'>> = {}
  ) {
    const { reply_parameters, ...rest } = params

    return this.sendMediaGroup(mediaGroup, {
      reply_parameters: {
        message_id: this.id,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with location */
  replyWithLocation (
    latitude: number,
    longitude: number,
    params: WithPartialReplyParameters<Optional<Methods.SendLocationParams, 'chat_id' | 'latitude' | 'longitude'>> = {}
  ) {
    const { reply_parameters, ...rest } = params

    return this.sendLocation(latitude, longitude, {
      reply_parameters: {
        message_id: this.id,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with invoice */
  replyWithInvoice (params: WithPartialReplyParameters<Optional<Methods.SendInvoiceParams, 'chat_id'>>) {
    const { reply_parameters, ...rest } = params

    return this.sendInvoice({
      reply_parameters: {
        message_id: this.id,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with venue */
  replyWithVenue (params: WithPartialReplyParameters<Optional<Methods.SendVenueParams, 'chat_id'>>) {
    const { reply_parameters, ...rest } = params

    return this.sendVenue({
      reply_parameters: {
        message_id: this.id,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with contact */
  replyWithContact (params: WithPartialReplyParameters<Optional<Methods.SendContactParams, 'chat_id'>>) {
    const { reply_parameters, ...rest } = params

    return this.sendContact({
      reply_parameters: {
        message_id: this.id,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with poll */
  replyWithPoll (params: WithPartialReplyParameters<Optional<Methods.SendPollParams, 'chat_id'>>) {
    const { reply_parameters, ...rest } = params

    return this.sendPoll({
      reply_parameters: {
        message_id: this.id,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with sticker */
  replyWithSticker (
    sticker: Methods.SendStickerParams['sticker'],
    params: WithPartialReplyParameters<Optional<Methods.SendStickerParams, 'chat_id' | 'sticker'>>
  ) {
    const { reply_parameters, ...rest } = params

    return this.sendSticker(sticker, {
      reply_parameters: {
        message_id: this.id,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with a dice */
  replyWithDice (
    emoji: Methods.SendDiceParams['emoji'],
    params: WithPartialReplyParameters<Partial<Methods.SendDiceParams>> = {}
  ) {
    const { reply_parameters, ...rest } = params

    return this.sendDice(emoji, {
      reply_parameters: {
        message_id: this.id,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with a quote */
  replyWithQuote (
    params:
      & WithQuote<{ text: AvailableText }>
      & WithPartialReplyParameters<Optional<Methods.SendMessageParams, 'chat_id' | 'text'>>
  ) {
    const { text, quote, reply_parameters, ...rest } = params

    return this.reply(text, {
      reply_parameters: {
        quote,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with a quote and a photo */
  quoteWithPhoto (
    params:
      & WithQuote<{ photo: Methods.SendPhotoParams['photo'] }>
      & WithPartialReplyParameters<Optional<Methods.SendPhotoParams, 'chat_id' | 'photo'>>
  ) {
    const { photo, quote, reply_parameters, ...rest } = params

    return this.replyWithPhoto(photo, {
      reply_parameters: {
        quote,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with a quote and a document */
  quoteWithDocument (
    params:
      & WithQuote<{ document: Methods.SendDocumentParams['document'] }>
      & WithPartialReplyParameters<Optional<Methods.SendDocumentParams, 'chat_id' | 'document'>>
  ) {
    const { document, quote, reply_parameters, ...rest } = params

    return this.replyWithDocument(document, {
      reply_parameters: {
        quote,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with a quote and an audio */
  quoteWithAudio (
    params:
      & WithQuote<{ audio: Methods.SendAudioParams['audio'] }>
      & WithPartialReplyParameters<Optional<Methods.SendAudioParams, 'chat_id' | 'audio'>>
  ) {
    const { audio, quote, reply_parameters, ...rest } = params

    return this.replyWithAudio(audio, {
      reply_parameters: {
        quote,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with a quote and a video */
  quoteWithVideo (
    params:
      & WithQuote<{ video: Methods.SendVideoParams['video'] }>
      & WithPartialReplyParameters<Optional<Methods.SendVideoParams, 'chat_id' | 'video'>>
  ) {
    const { video, quote, reply_parameters, ...rest } = params

    return this.replyWithVideo(video, {
      reply_parameters: {
        quote,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with a quote and an animation */
  quoteWithAnimation (
    params:
      & WithQuote<{ animation: Methods.SendAnimationParams['animation'] }>
      & WithPartialReplyParameters<Optional<Methods.SendAnimationParams, 'chat_id' | 'animation'>>
  ) {
    const { animation, quote, reply_parameters, ...rest } = params

    return this.replyWithAnimation(animation, {
      reply_parameters: {
        quote,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with a quote and a video note */
  quoteWithVideoNote (
    params:
      & WithQuote<{ videoNote: Methods.SendVideoNoteParams['video_note'] }>
      & WithPartialReplyParameters<Optional<Methods.SendVideoNoteParams, 'chat_id' | 'video_note'>>
  ) {
    const { videoNote, quote, reply_parameters, ...rest } = params

    return this.replyWithVideoNote(videoNote, {
      reply_parameters: {
        quote,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with a quote and a voice */
  quoteWithVoice (
    params:
      & WithQuote<{ voice: Methods.SendVoiceParams['voice'] }>
      & WithPartialReplyParameters<Optional<Methods.SendVoiceParams, 'chat_id' | 'voice'>>
  ) {
    const { voice, quote, reply_parameters, ...rest } = params

    return this.replyWithVoice(voice, {
      reply_parameters: {
        quote,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with a quote and a media group */
  quoteWithMediaGroup (
    params:
      & WithQuote<{ mediaGroup: Methods.SendMediaGroupParams['media'] }>
      & WithPartialReplyParameters<Optional<Methods.SendMediaGroupParams, 'chat_id' | 'media'>>
  ) {
    const { mediaGroup, quote, reply_parameters, ...rest } = params

    return this.replyWithMediaGroup(mediaGroup, {
      reply_parameters: {
        quote,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with a quote and a location */
  quoteWithLocation (
    params:
      & WithQuote<{ latitude: number, longitude: number }>
      & WithPartialReplyParameters<Optional<Methods.SendLocationParams, 'chat_id' | 'latitude' | 'longitude'>>
  ) {
    const { latitude, longitude, quote, reply_parameters, ...rest } = params

    return this.replyWithLocation(latitude, longitude, {
      reply_parameters: {
        quote,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with a quote and an invoice */
  quoteWithInvoice (
    params:
      & WithQuote
      & WithPartialReplyParameters<Optional<Methods.SendInvoiceParams, 'chat_id'>>
  ) {
    const { quote, reply_parameters, ...rest } = params

    return this.replyWithInvoice({
      reply_parameters: {
        quote,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with a quote and a venue */
  quoteWithVenue (
    params:
      & WithQuote
      & WithPartialReplyParameters<Optional<Methods.SendVenueParams, 'chat_id'>>
  ) {
    const { quote, reply_parameters, ...rest } = params

    return this.replyWithVenue({
      reply_parameters: {
        quote,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with a quote and a contact */
  quoteWithContact (
    params:
      & WithQuote
      & WithPartialReplyParameters<Optional<Methods.SendContactParams, 'chat_id'>>
  ) {
    const { quote, reply_parameters, ...rest } = params

    return this.replyWithContact({
      reply_parameters: {
        quote,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with a quote and a poll */
  quoteWithPoll (
    params:
      & WithQuote
      & WithPartialReplyParameters<Optional<Methods.SendPollParams, 'chat_id'>>
  ) {
    const { quote, reply_parameters, ...rest } = params

    return this.replyWithPoll({
      reply_parameters: {
        quote,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with a quote and a sticker */
  quoteWithSticker (
    params:
      & WithQuote<{ sticker: Methods.SendStickerParams['sticker'] }>
      & WithPartialReplyParameters<Optional<Methods.SendStickerParams, 'chat_id' | 'sticker'>>
  ) {
    const { sticker, quote, reply_parameters, ...rest } = params

    return this.replyWithSticker(sticker, {
      reply_parameters: {
        quote,
        ...reply_parameters
      },
      ...rest
    })
  }

  /** Replies to current message with a quote and a dice */
  quoteWithDice (
    params:
      & WithQuote<{ emoji: Methods.SendDiceParams['emoji'] }>
      & WithPartialReplyParameters<Partial<Methods.SendDiceParams>>
  ) {
    const { emoji, quote, reply_parameters, ...rest } = params

    return this.replyWithDice(emoji, {
      reply_parameters: {
        quote,
        ...reply_parameters
      },
      ...rest
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

  /** Edits current message live location. An alias for `editMessageLiveLocation` */
  editLiveLocation (params: Methods.EditMessageLiveLocationParams) {
    return this.editMessageLiveLocation(params)
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

  /** Stops current message live location. An alias for `stopMessageLiveLocation` */
  stopLiveLocation (params?: Methods.StopMessageLiveLocationParams) {
    return this.stopMessageLiveLocation(params)
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

  /** Edits current message text. An alias for `editMessageText` */
  editText (
    text: Methods.EditMessageTextParams['text'],
    params?: Partial<Methods.EditMessageTextParams>
  ) {
    return this.editMessageText(text, params)
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

  /** Edits current message caption. An alias for `editMessageCaption` */
  editCaption (
    caption: NonNullable<Methods.EditMessageCaptionParams['caption']>,
    params?: Partial<Methods.EditMessageCaptionParams>
  ) {
    return this.editMessageCaption(caption, params)
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

  /** Edits current message media. An alias for `editMessageMedia` */
  editMedia (
    media: Methods.EditMessageMediaParams['media'],
    params?: Partial<Methods.EditMessageMediaParams>
  ) {
    return this.editMessageMedia(media, params)
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

  /** Edits current message reply markup. An alias for `editMessageReplyMarkup` */
  editReplyMarkup (
    replyMarkup: InlineKeyboard | InlineKeyboardBuilder | Interfaces.TelegramInlineKeyboardMarkup,
    params?: Partial<Methods.EditMessageReplyMarkupParams>
  ) {
    return this.editMessageReplyMarkup(replyMarkup, params)
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

  /** Reacts to a message */
  react (rawReactions: MaybeArray<Interfaces.TelegramReactionTypeEmoji['emoji'] | Interfaces.TelegramReactionType>, params: Optional<Methods.SetMessageReactionParams, 'chat_id' | 'message_id'> = {}) {
    const reactions = (
      Array.isArray(rawReactions) ? rawReactions : [rawReactions]
    ).map(r => typeof r === 'string' ? { type: 'emoji', emoji: r } as Interfaces.TelegramReactionTypeEmoji : r)

    return this.telegram.api.setMessageReaction({
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id,
      reaction: reactions,
      ...params
    })
  }

  /** Clears reactions from the message */
  clearReactions (params: Optional<Methods.SetMessageReactionParams, 'chat_id' | 'message_id'> = {}) {
    return this.telegram.api.setMessageReaction({
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id,
      ...params
    })
  }
}

interface NodeMixin extends Context, NodeMixinMetadata, SendMixin { }

export { NodeMixin }
