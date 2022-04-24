import { inspectable } from 'inspectable'

import {
  BotCommand,
  Chat,
  Poll,
  User,
  VideoChatScheduled
} from '../common/structures'

import {
  TelegramInputMedia,
  TelegramBotCommand,
  TelegramInlineKeyboardMarkup,
  TelegramMessage,
  TelegramChat,
  TelegramUpdate
} from '../telegram-interfaces'

import {
  EditMessageCaptionParams,
  EditMessageLiveLocationParams,
  EditMessageMediaParams,
  EditMessageReplyMarkupParams,
  EditMessageTextParams,
  SendAnimationParams,
  SendAudioParams,
  SendChatActionParams,
  SendContactParams,
  SendDiceParams,
  SendDocumentParams,
  SendInvoiceParams,
  SendLocationParams,
  SendMediaGroupParams,
  SendMessageParams,
  SendPhotoParams,
  SendPollParams,
  SendStickerParams,
  SendVenueParams,
  SendVideoNoteParams,
  SendVideoParams,
  SendVoiceParams,
  StopMessageLiveLocationParams,
  StopPollParams
} from '../methods'

import { Telegram } from '../telegram'

import { Optional } from '../types'
import { MediaInput } from '../media-source'

import { Context } from './context'
import { MessageContext } from './message'

interface VideoChatScheduledContextOptions {
  telegram: Telegram
  update: TelegramUpdate
  payload: TelegramMessage
  updateId: number
}

class VideoChatScheduledContext extends Context {
  public payload: TelegramMessage

  constructor(options: VideoChatScheduledContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'video_chat_scheduled',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Unique message identifier inside this chat */
  public get id(): number {
    return this.payload.message_id
  }

  /** Sender, empty for messages sent to channels */
  public get from(): User | undefined {
    const { from } = this.payload

    if (!from) {
      return
    }

    return new User(from)
  }

  /** Sender's ID */
  public get senderId(): number | undefined {
    return this.from?.id
  }

  /** Date the message was sent in Unix time */
  public get createdAt(): number {
    return this.payload.date
  }

  /** Conversation the message belongs to */
  public get chat(): Chat | undefined {
    const { chat } = this.payload

    if (!chat) {
      return
    }

    return new Chat(chat)
  }

  /** Chat ID */
  public get chatId(): number | undefined {
    return this.chat?.id
  }

  /** Chat type */
  public get chatType(): TelegramChat['type'] | undefined {
    return this.chat?.type
  }

  /** Is this chat a private one? */
  public get isPM(): boolean {
    return this.chatType === 'private'
  }

  /** Is this chat a group? */
  public get isGroup(): boolean {
    return this.chatType === 'group'
  }

  /** Is this chat a supergroup? */
  public get isSupergroup(): boolean {
    return this.chatType === 'supergroup'
  }

  /** Is this chat a channel? */
  public get isChannel(): boolean {
    return this.chatType === 'channel'
  }

  /** Service message: video chat scheduled */
  public get videoChatScheduled(): VideoChatScheduled {
    return new VideoChatScheduled(this.payload.video_chat_scheduled!)
  }

  /** Sends message to current chat */
  public async send(
    text: string,
    params?: Optional<SendMessageParams, 'chat_id' | 'text'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendMessage({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      text
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Replies to current message */
  public reply(
    text: string,
    params?: Optional<SendMessageParams, 'chat_id' | 'text'>
  ): Promise<MessageContext> {
    return this.send(text, {
      ...params,
      reply_to_message_id: this.id
    })
  }

  /** Sends photo to current chat */
  public async sendPhoto(
    photo: MediaInput,
    params?: Optional<SendPhotoParams, 'chat_id' | 'photo'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendPhoto({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      photo
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Replies to current message with photo */
  public replyWithPhoto(
    photo: MediaInput,
    params?: Optional<SendPhotoParams, 'chat_id' | 'photo'>
  ): Promise<MessageContext> {
    return this.sendPhoto(photo, {
      ...params,
      reply_to_message_id: this.id
    })
  }

  /** Sends document to current chat */
  public async sendDocument(
    document: MediaInput,
    params?: Optional<SendDocumentParams, 'chat_id' | 'document'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendDocument({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      document
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Replies to current message with document */
  public replyWithDocument(
    document: MediaInput,
    params?: Optional<SendDocumentParams, 'chat_id' | 'document'>
  ): Promise<MessageContext> {
    return this.sendDocument(document, {
      ...params,
      reply_to_message_id: this.id
    })
  }

  /** Sends audio to current chat */
  public async sendAudio(
    audio: MediaInput,
    params?: Optional<SendAudioParams, 'chat_id' | 'audio'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendAudio({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      audio
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Replies to current message with audio */
  public replyWithAudio(
    audio: MediaInput,
    params?: Optional<SendAudioParams, 'chat_id' | 'audio'>
  ): Promise<MessageContext> {
    return this.sendAudio(audio, {
      ...params,
      reply_to_message_id: this.id
    })
  }

  /** Sends video to current chat */
  public async sendVideo(
    video: MediaInput,
    params?: Optional<SendVideoParams, 'chat_id' | 'video'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVideo({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      video
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Replies to current message with video */
  public replyWithVideo(
    video: MediaInput,
    params?: Optional<SendVideoParams, 'chat_id' | 'video'>
  ): Promise<MessageContext> {
    return this.sendVideo(video, {
      ...params,
      reply_to_message_id: this.id
    })
  }

  /** Sends animation to current chat */
  public async sendAnimation(
    animation: MediaInput,
    params?: Optional<SendAnimationParams, 'chat_id' | 'animation'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendAnimation({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      animation
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Replies to current message with animation */
  public replyWithAnimation(
    animation: MediaInput,
    params?: Optional<SendAnimationParams, 'chat_id' | 'animation'>
  ): Promise<MessageContext> {
    return this.sendAnimation(animation, {
      ...params,
      reply_to_message_id: this.id
    })
  }

  /** Sends video note to current chat */
  public async sendVideoNote(
    videoNote: MediaInput,
    params?: Optional<SendVideoNoteParams, 'chat_id' | 'video_note'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVideoNote({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      video_note: videoNote
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Replies to current message with video note */
  public replyWithVideoNote(
    videoNote: MediaInput,
    params?: Optional<SendVideoNoteParams, 'chat_id' | 'video_note'>
  ): Promise<MessageContext> {
    return this.sendVideoNote(videoNote, {
      ...params,
      reply_to_message_id: this.id
    })
  }

  /** Sends voice to current chat */
  public async sendVoice(
    voice: MediaInput,
    params?: Optional<SendVoiceParams, 'chat_id' | 'voice'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVoice({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      voice
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Replies to current message with voice */
  public replyWithVoice(
    voice: MediaInput,
    params?: Optional<SendVoiceParams, 'chat_id' | 'voice'>
  ): Promise<MessageContext> {
    return this.sendVoice(voice, {
      ...params,
      reply_to_message_id: this.id
    })
  }

  /** Sends media group to current chat */
  public async sendMediaGroup(
    mediaGroup: SendMediaGroupParams['media'],
    params?: Partial<SendMediaGroupParams>
  ): Promise<MessageContext[]> {
    const response = await this.telegram.api.sendMediaGroup({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      media: mediaGroup
    })

    return response.map(
      (message: TelegramMessage) => new MessageContext({
        telegram: this.telegram,
        payload: message
      })
    )
  }

  /** Replies to current message with media group */
  public replyWithMediaGroup(
    mediaGroup: SendMediaGroupParams['media'],
    params?: Partial<SendMediaGroupParams>
  ): Promise<MessageContext[]> {
    return this.sendMediaGroup(mediaGroup, {
      ...params,
      reply_to_message_id: this.id
    })
  }

  /** Sends location to current chat */
  public async sendLocation(
    latitude: number,
    longitude: number,
    params?: Optional<SendLocationParams, 'chat_id' | 'latitude' | 'longitude'>
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
  public replyWithLocation(
    latitude: number,
    longitude: number,
    params?: Optional<SendLocationParams, 'chat_id' | 'latitude' | 'longitude'>
  ): Promise<MessageContext> {
    return this.sendLocation(latitude, longitude, {
      ...params,
      reply_to_message_id: this.id
    })
  }

  /** Sends invoice to current user */
  public async sendInvoice(params: SendInvoiceParams): Promise<MessageContext> {
    const response = await this.telegram.api.sendInvoice({
      ...params,
      chat_id: this.chatId || this.senderId || 0
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Edits current message live location */
  public async editMessageLiveLocation(
    params: EditMessageLiveLocationParams
  ): Promise<true | MessageContext> {
    const response = await this.telegram.api.editMessageLiveLocation({
      ...params,
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

  /** Stops current message live location */
  public async stopMessageLiveLocation(
    params?: StopMessageLiveLocationParams
  ): Promise<true | MessageContext> {
    const response = await this.telegram.api.stopMessageLiveLocation({
      ...params,
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

  /** Sends venue to current chat */
  public async sendVenue(
    params: Optional<SendVenueParams, 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendVenue({
      ...params,
      chat_id: this.chatId || this.senderId || 0
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Replies to current message with venue */
  public replyWithVenue(
    params: Optional<SendVenueParams, 'chat_id'>
  ): Promise<MessageContext> {
    return this.sendVenue({
      ...params,
      reply_to_message_id: this.id
    })
  }

  /** Sends contact to current chat */
  public async sendContact(
    params: Optional<SendContactParams, 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendContact({
      ...params,
      chat_id: this.chatId || this.senderId || 0
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Replies to current message with contact */
  public replyWithContact(
    params: Optional<SendContactParams, 'chat_id'>
  ): Promise<MessageContext> {
    return this.sendContact({
      ...params,
      reply_to_message_id: this.id
    })
  }

  /** Sends poll to current chat */
  public async sendPoll(
    params: Optional<SendPollParams, 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendPoll({
      ...params,
      chat_id: this.chatId || this.senderId || 0
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Replies to current message with poll */
  public replyWithPoll(
    params: Optional<SendPollParams, 'chat_id'>
  ): Promise<MessageContext> {
    return this.sendPoll({
      ...params,
      reply_to_message_id: this.id
    })
  }

  /** Stops poll in current chat */
  public async stopPoll(
    messageId: number,
    params?: Partial<StopPollParams>
  ): Promise<Poll> {
    const response = await this.telegram.api.stopPoll({
      ...params,
      chat_id: this.chatId || this.senderId || 0,
      message_id: messageId
    })

    return new Poll(response)
  }

  /** Sends chat action to current chat */
  public sendChatAction(action: SendChatActionParams['action']): Promise<true> {
    return this.telegram.api.sendChatAction({
      chat_id: this.chatId || this.senderId || 0,
      action
    })
  }

  /** Deletes current message */
  public deleteMessage(): Promise<true> {
    return this.telegram.api.deleteMessage({
      chat_id: this.chatId || this.senderId || 0,
      message_id: this.id
    })
  }

  /** Sends sticker */
  public async sendSticker(
    sticker: MediaInput,
    params?: Optional<SendStickerParams, 'sticker' | 'chat_id'>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendSticker({
      ...params,
      sticker,
      chat_id: this.chatId || this.senderId || 0
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Sends dice */
  public async sendDice(
    emoji: SendDiceParams['emoji'],
    params?: Partial<SendDiceParams>
  ): Promise<MessageContext> {
    const response = await this.telegram.api.sendDice({
      ...params,
      emoji,
      chat_id: this.chatId || this.senderId || 0
    })

    return new MessageContext({
      telegram: this.telegram,
      payload: response
    })
  }

  /** Gets commands */
  public async getMyCommands(): Promise<BotCommand[]> {
    const response = await this.telegram.api.getMyCommands()

    return response.map(
      (command: TelegramBotCommand) => new BotCommand(command)
    )
  }

  // Edit methods

  /** Edits current message text */
  public async editMessageText(
    text: string,
    params?: Partial<EditMessageTextParams>
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
  public async editMessageCaption(
    caption: string,
    params?: Partial<EditMessageCaptionParams>
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
  public async editMessageMedia(
    media: TelegramInputMedia,
    params?: Partial<EditMessageMediaParams>
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
  public async editMessageReplyMarkup(
    replyMarkup: TelegramInlineKeyboardMarkup,
    params?: Partial<EditMessageReplyMarkupParams>
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

inspectable(VideoChatScheduledContext, {
  serialize(context: VideoChatScheduledContext) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      videoChatScheduled: context.videoChatScheduled
    }
  }
})

export { VideoChatScheduledContext }
