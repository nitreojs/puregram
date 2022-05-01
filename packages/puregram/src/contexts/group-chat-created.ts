import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import * as Methods from '../generated/methods'
import { User, Chat, BotCommand } from '../common/structures'

import { Optional } from '../types/types'
import { MediaInput } from '../media-source'
import { Telegram } from '../telegram'
import { Poll } from '../updates/'

import { Context } from './context'
import { MessageContext } from './message'

interface GroupChatCreatedContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class GroupChatCreatedContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor(options: GroupChatCreatedContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'group_chat_created',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Unique message identifier inside this chat */
  get id() {
    return this.payload.message_id
  }

  /** Sender, empty for messages sent to channels */
  get from() {
    const { from } = this.payload

    if (!from) {
      return
    }

    return new User(from)
  }

  /** Sender's ID */
  get senderId() {
    return this.from?.id
  }

  /** Date the message was sent in Unix time */
  get createdAt() {
    return this.payload.date
  }

  /** Conversation the message belongs to */
  get chat() {
    const { chat } = this.payload

    if (!chat) {
      return
    }

    return new Chat(chat)
  }

  /** Chat ID */
  get chatId() {
    return this.chat?.id
  }

  /** Chat type */
  get chatType() {
    return this.chat?.type
  }

  /** Is this chat a private one? */
  get isPM() {
    return this.chatType === 'private'
  }

  /** Is this chat a group? */
  get isGroup() {
    return this.chatType === 'group'
  }

  /** Is this chat a supergroup? */
  get isSupergroup() {
    return this.chatType === 'supergroup'
  }

  /** Is this chat a channel? */
  get isChannel() {
    return this.chatType === 'channel'
  }

  /** Sends message to current chat */
  async send(
    text: string,
    params?: Optional<Methods.SendMessageParams, 'chat_id' | 'text'>
  ): Promise<MessageContext> {
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

  /** Replies to current message */
  reply(
    text: string,
    params?: Optional<Methods.SendMessageParams, 'chat_id' | 'text'>
  ): Promise<MessageContext> {
    return this.send(text, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends photo to current chat */
  async sendPhoto(
    photo: MediaInput,
    params?: Optional<Methods.SendPhotoParams, 'chat_id' | 'photo'>
  ): Promise<MessageContext> {
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

  /** Replies to current message with photo */
  replyWithPhoto(
    photo: MediaInput,
    params?: Optional<Methods.SendPhotoParams, 'chat_id' | 'photo'>
  ): Promise<MessageContext> {
    return this.sendPhoto(photo, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends document to current chat */
  async sendDocument(
    document: MediaInput,
    params?: Optional<Methods.SendDocumentParams, 'chat_id' | 'document'>
  ): Promise<MessageContext> {
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

  /** Replies to current message with document */
  replyWithDocument(
    document: MediaInput,
    params?: Optional<Methods.SendDocumentParams, 'chat_id' | 'document'>
  ): Promise<MessageContext> {
    return this.sendDocument(document, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends audio to current chat */
  async sendAudio(
    audio: MediaInput,
    params?: Optional<Methods.SendAudioParams, 'chat_id' | 'audio'>
  ): Promise<MessageContext> {
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

  /** Replies to current message with audio */
  replyWithAudio(
    audio: MediaInput,
    params?: Optional<Methods.SendAudioParams, 'chat_id' | 'audio'>
  ): Promise<MessageContext> {
    return this.sendAudio(audio, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends video to current chat */
  async sendVideo(
    video: MediaInput,
    params?: Optional<Methods.SendVideoParams, 'chat_id' | 'video'>
  ): Promise<MessageContext> {
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

  /** Replies to current message with video */
  replyWithVideo(
    video: MediaInput,
    params?: Optional<Methods.SendVideoParams, 'chat_id' | 'video'>
  ): Promise<MessageContext> {
    return this.sendVideo(video, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends animation to current chat */
  async sendAnimation(
    animation: MediaInput,
    params?: Optional<Methods.SendAnimationParams, 'chat_id' | 'animation'>
  ): Promise<MessageContext> {
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

  /** Replies to current message with animation */
  replyWithAnimation(
    animation: MediaInput,
    params?: Optional<Methods.SendAnimationParams, 'chat_id' | 'animation'>
  ): Promise<MessageContext> {
    return this.sendAnimation(animation, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends video note to current chat */
  async sendVideoNote(
    videoNote: MediaInput,
    params?: Optional<Methods.SendVideoNoteParams, 'chat_id' | 'video_note'>
  ): Promise<MessageContext> {
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

  /** Replies to current message with video note */
  replyWithVideoNote(
    videoNote: MediaInput,
    params?: Optional<Methods.SendVideoNoteParams, 'chat_id' | 'video_note'>
  ): Promise<MessageContext> {
    return this.sendVideoNote(videoNote, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends voice to current chat */
  async sendVoice(
    voice: MediaInput,
    params?: Optional<Methods.SendVoiceParams, 'chat_id' | 'voice'>
  ): Promise<MessageContext> {
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

  /** Replies to current message with voice */
  replyWithVoice(
    voice: MediaInput,
    params?: Optional<Methods.SendVoiceParams, 'chat_id' | 'voice'>
  ): Promise<MessageContext> {
    return this.sendVoice(voice, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends media group to current chat */
  async sendMediaGroup(
    mediaGroup: Methods.SendMediaGroupParams['media'],
    params?: Partial<Methods.SendMediaGroupParams>
  ): Promise<MessageContext[]> {
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

  /** Replies to current message with media group */
  replyWithMediaGroup(
    mediaGroup: Methods.SendMediaGroupParams['media'],
    params?: Partial<Methods.SendMediaGroupParams>
  ): Promise<MessageContext[]> {
    return this.sendMediaGroup(mediaGroup, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends location to current chat */
  async sendLocation(
    latitude: number,
    longitude: number,
    params?: Optional<Methods.SendLocationParams, 'chat_id' | 'latitude' | 'longitude'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendLocation({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      latitude,
      longitude
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Replies to current message with location */
  replyWithLocation(
    latitude: number,
    longitude: number,
    params?: Optional<Methods.SendLocationParams, 'chat_id' | 'latitude' | 'longitude'>
  ): Promise<MessageContext> {
    return this.sendLocation(latitude, longitude, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends invoice to current user */
  async sendInvoice(params: Optional<Methods.SendInvoiceParams, 'chat_id'>): Promise<MessageContext> {
    const response = await this.telegram.api.sendInvoice({
      chat_id: this.chatId || this.senderId || 0,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Edits current message live location */
  async editMessageLiveLocation(
    params: Methods.EditMessageLiveLocationParams
  ): Promise<true | MessageContext> {
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
  ): Promise<true | MessageContext> {
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

  /** Sends venue to current chat */
  async sendVenue(
    params: Optional<Methods.SendVenueParams, 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVenue({
      chat_id: this.chatId || this.senderId || 0,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Replies to current message with venue */
  replyWithVenue(
    params: Optional<Methods.SendVenueParams, 'chat_id'>
  ): Promise<MessageContext> {
    return this.sendVenue({
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends contact to current chat */
  async sendContact(
    params: Optional<Methods.SendContactParams, 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendContact({
      chat_id: this.chatId || this.senderId || 0,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Replies to current message with contact */
  replyWithContact(
    params: Optional<Methods.SendContactParams, 'chat_id'>
  ): Promise<MessageContext> {
    return this.sendContact({
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends poll to current chat */
  async sendPoll(
    params: Optional<Methods.SendPollParams, 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendPoll({
      chat_id: this.chatId || this.senderId || 0,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Replies to current message with poll */
  replyWithPoll(
    params: Optional<Methods.SendPollParams, 'chat_id'>
  ): Promise<MessageContext> {
    return this.sendPoll({
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Stops poll in current chat */
  async stopPoll(
    messageId: number,
    params?: Partial<Methods.StopPollParams>
  ): Promise<Poll> {
    const response = await this.telegram.api.stopPoll({
      chat_id: this.chatId || this.senderId || 0,
      message_id: messageId,
      ...params
    })

    return new Poll(response)
  }

  /** Sends chat action to current chat */
  sendChatAction(action: Methods.SendChatActionParams['action']): Promise<true> {
    return this.telegram.api.sendChatAction({
      chat_id: this.chatId || this.senderId || 0,
      action
    })
  }

  /** Deletes current message */
  deleteMessage(): Promise<true> {
    return this.telegram.api.deleteMessage({
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id
    })
  }

  /** Sends sticker */
  async sendSticker(
    sticker: MediaInput,
    params?: Optional<Methods.SendStickerParams, 'sticker' | 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendSticker({
      sticker,
      chat_id: this.chatId || this.senderId || 0,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends dice */
  async sendDice(
    emoji: Methods.SendDiceParams['emoji'],
    params?: Partial<Methods.SendDiceParams>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendDice({
      emoji,
      chat_id: this.chatId || this.senderId || 0,
      ...params
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Gets commands */
  async getMyCommands(): Promise<BotCommand[]> {
    const response = await this.telegram.api.getMyCommands()

    return response.map(
      (command: Interfaces.TelegramBotCommand) => new BotCommand(command)
    )
  }

  // Edit methods

  /** Edits current message text */
  async editMessageText(
    text: string,
    params?: Partial<Methods.EditMessageTextParams>
  ): Promise<true | MessageContext> {
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
  ): Promise<true | MessageContext> {
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
  ): Promise<true | MessageContext> {
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
  ): Promise<true | MessageContext> {
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

inspectable(GroupChatCreatedContext, {
  serialize(context: GroupChatCreatedContext) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType
    }
  }
})

export { GroupChatCreatedContext }
