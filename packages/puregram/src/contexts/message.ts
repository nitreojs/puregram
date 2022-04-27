import { inspectable } from 'inspectable'

import { Context } from './context'

import { Telegram } from '../telegram'
import { MediaInput } from '../media-source'
import { Message } from '../updates/'

import {
  AttachmentType as AttachmentTypeEnum,
  EntityType
} from '../types/enums'

import {
  TelegramInputMedia,
  TelegramBotCommand,
  TelegramInlineKeyboardMarkup,
  TelegramMessage,
  TelegramChat,
  TelegramUpdate
} from '../generated/telegram-interfaces'

import {
  applyMixins,
  filterPayload,
  isParseable
} from '../utils/helpers'

import {
  AttachmentType,
  MessageEventName,
  Optional,
  UpdateName
} from '../types/types'

import { EVENTS } from '../utils/constants'

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
} from '../generated/methods'

import { Poll } from '../updates/'
import { BotCommand } from '../common/structures/bot-command'
import { MessageEntity } from '../common/structures/message-entity'

import {
  AnimationAttachment,
  Attachment,
  AudioAttachment,
  DocumentAttachment,
  PhotoAttachment,
  StickerAttachment,
  VideoAttachment,
  VideoNoteAttachment,
  VoiceAttachment
} from '../common/attachments'

interface MessageContextOptions {
  telegram: Telegram
  update?: TelegramUpdate
  payload: TelegramMessage
  updateId?: number
  type?: UpdateName
}

/** Called when `message` event occurs */
class MessageContext extends Context {
  payload: TelegramMessage

  constructor(options: MessageContextOptions) {
    super({
      telegram: options.telegram,
      updateType: options.type ?? 'message',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Sender's ID */
  get senderId() {
    return this.from?.id
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

  /** Checks if the message has `dice` property */
  get hasDice() {
    return this.dice !== undefined
  }

  get startPayload() {
    if (!this.hasText) {
      return
    }
    if (!this.text!.startsWith('/start') || this.text === '/start') {
      return
    }

    let payload: any = this.text!.split(' ')[1]

    if (!Number.isNaN(+payload)) {
      payload = Number.parseInt(payload, 10)
    } else if (isParseable(payload)) {
      payload = JSON.parse(payload)
    }

    return payload
  }

  /** Checks if the message has `text` property */
  get hasText() {
    return this.text !== undefined
  }

  /** Checks if the message has `author_signature` property */
  get hasAuthorSignature() {
    return this.authorSignature !== undefined
  }

  /** Checks if there are any entities (with specified type) */
  hasEntities(type?: EntityType | MessageEntity['type']) {
    if (type === undefined) {
      return this.entities.length !== 0
    }

    return this.entities.some(
      (entity: MessageEntity) => entity.type === type
    )
  }

  /** Checks if the message has `caption` property */
  get hasCaption() {
    return this.caption !== undefined
  }

  /** Checks if there are any caption entities (with specified type) */
  hasCaptionEntities(type?: EntityType | MessageEntity['type']) {
    if (type === undefined) {
      return this.captionEntities.length !== 0
    }

    return this.captionEntities.some(
      (entity: MessageEntity) => entity.type === type
    )
  }

  /** Message attachments */
  get attachments() {
    const attachments: Attachment[] = []

    if (this.audio) attachments.push(this.audio)
    if (this.document) attachments.push(this.document)
    if (this.animation) attachments.push(this.animation)
    if (this.photo) attachments.push(new PhotoAttachment(this.photo))
    if (this.sticker) attachments.push(this.sticker)
    if (this.video) attachments.push(this.video)
    if (this.voice) attachments.push(this.voice)
    if (this.videoNote) attachments.push(this.videoNote)
    if (this.venue) attachments.push(this.venue)

    return attachments
  }

  /** Checks if there are attachments */
  hasAttachments(type?: AttachmentType | AttachmentTypeEnum) {
    if (type === undefined) {
      return this.attachments.length > 0
    }

    return this.attachments.some(
      (attachment: Attachment) => attachment.attachmentType === type
    )
  }

  /** Gets attachments */
  getAttachments(type: AttachmentTypeEnum.ANIMATION | 'animation'): AnimationAttachment[]

  getAttachments(type: AttachmentTypeEnum.AUDIO | 'audio'): AudioAttachment[]

  getAttachments(type: AttachmentTypeEnum.DOCUMENT | 'document'): DocumentAttachment[]

  getAttachments(type: AttachmentTypeEnum.PHOTO | 'photo'): PhotoAttachment[]

  getAttachments(type: AttachmentTypeEnum.STICKER | 'sticker'): StickerAttachment[]

  getAttachments(type: AttachmentTypeEnum.VIDEO | 'video'): VideoAttachment[]

  getAttachments(type: AttachmentTypeEnum.VIDEO_NOTE | 'video_note'): VideoNoteAttachment[]

  getAttachments(type: AttachmentTypeEnum.VOICE | 'voice'): VoiceAttachment[]

  getAttachments(type?: AttachmentType | AttachmentTypeEnum): Attachment[]

  getAttachments(type?: any): Attachment[] {
    if (type === undefined) {
      return this.attachments
    }

    return this.attachments.filter(
      (attachment: Attachment) => attachment.attachmentType === type
    )
  }

  /** Is this message an event? */
  get isEvent() {
    return EVENTS.some(
      (event) => Boolean(
        this[
        event[0] as keyof Message
        ]
      )
    )
  }

  /** Event type */
  get eventType() {
    if (!this.isEvent) {
      return
    }

    const value: (
      [keyof Message, MessageEventName] | undefined
    ) = EVENTS.find(
      (event) => {
        const tValue = this[
          event[0] as keyof Message
        ]

        if (Array.isArray(tValue)) {
          return tValue.length !== 0
        }

        return tValue !== undefined
      }
    )

    if (value === undefined) {
      return
    }

    return value[1]
  }

  /** Is this message a forwarded one? */
  get isForward() {
    return this.forwardMessage !== undefined
  }

  /** Does this message have reply message? */
  get hasReplyMessage() {
    return this.replyMessage !== undefined
  }

  /** Checks if the sent message has `via_bot` property */
  get hasViaBot() {
    return this.viaBot !== undefined
  }

  /** Does this message have start payload? */
  get hasStartPayload() {
    return this.startPayload !== undefined
  }

  /** Sends message to current chat */
  async send(
    text: string,
    params?: Optional<SendMessageParams, 'chat_id' | 'text'>
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
    params?: Optional<SendMessageParams, 'chat_id' | 'text'>
  ): Promise<MessageContext> {
    return this.send(text, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends photo to current chat */
  async sendPhoto(
    photo: MediaInput,
    params?: Optional<SendPhotoParams, 'chat_id' | 'photo'>
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
    params?: Optional<SendPhotoParams, 'chat_id' | 'photo'>
  ): Promise<MessageContext> {
    return this.sendPhoto(photo, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends document to current chat */
  async sendDocument(
    document: MediaInput,
    params?: Optional<SendDocumentParams, 'chat_id' | 'document'>
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
    params?: Optional<SendDocumentParams, 'chat_id' | 'document'>
  ): Promise<MessageContext> {
    return this.sendDocument(document, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends audio to current chat */
  async sendAudio(
    audio: MediaInput,
    params?: Optional<SendAudioParams, 'chat_id' | 'audio'>
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
    params?: Optional<SendAudioParams, 'chat_id' | 'audio'>
  ): Promise<MessageContext> {
    return this.sendAudio(audio, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends video to current chat */
  async sendVideo(
    video: MediaInput,
    params?: Optional<SendVideoParams, 'chat_id' | 'video'>
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
    params?: Optional<SendVideoParams, 'chat_id' | 'video'>
  ): Promise<MessageContext> {
    return this.sendVideo(video, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends animation to current chat */
  async sendAnimation(
    animation: MediaInput,
    params?: Optional<SendAnimationParams, 'chat_id' | 'animation'>
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
    params?: Optional<SendAnimationParams, 'chat_id' | 'animation'>
  ): Promise<MessageContext> {
    return this.sendAnimation(animation, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends video note to current chat */
  async sendVideoNote(
    videoNote: MediaInput,
    params?: Optional<SendVideoNoteParams, 'chat_id' | 'video_note'>
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
    params?: Optional<SendVideoNoteParams, 'chat_id' | 'video_note'>
  ): Promise<MessageContext> {
    return this.sendVideoNote(videoNote, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends voice to current chat */
  async sendVoice(
    voice: MediaInput,
    params?: Optional<SendVoiceParams, 'chat_id' | 'voice'>
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
    params?: Optional<SendVoiceParams, 'chat_id'>
  ): Promise<MessageContext> {
    return this.sendVoice(voice, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends media group to current chat */
  async sendMediaGroup(
    mediaGroup: SendMediaGroupParams['media'],
    params?: Optional<SendMediaGroupParams, 'chat_id' | 'media'>
  ): Promise<MessageContext[]> {
    const response = await this.telegram.api.sendMediaGroup({
      chat_id: this.chatId || this.senderId || 0,
      media: mediaGroup,
      ...params
    })

    return response.map(
      (message: TelegramMessage) => new MessageContext({
        telegram: this.telegram,
        payload: message
      })
    )
  }

  /** Replies to current message with media group */
  replyWithMediaGroup(
    mediaGroup: SendMediaGroupParams['media'],
    params?: Optional<SendMediaGroupParams, 'chat_id' | 'media'>
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
  replyWithLocation(
    latitude: number,
    longitude: number,
    params?: Optional<SendLocationParams, 'chat_id' | 'latitude' | 'longitude'>
  ): Promise<MessageContext> {
    return this.sendLocation(latitude, longitude, {
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends invoice to current user */
  async sendInvoice(
    params: Optional<SendInvoiceParams, 'chat_id'>
  ): Promise<MessageContext> {
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
    params: EditMessageLiveLocationParams
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
    params?: StopMessageLiveLocationParams
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
    params: Optional<SendVenueParams, 'chat_id'>
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
    params: Optional<SendVenueParams, 'chat_id'>
  ): Promise<MessageContext> {
    return this.sendVenue({
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends contact to current chat */
  async sendContact(
    params: Optional<SendContactParams, 'chat_id'>
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
    params: Optional<SendContactParams, 'chat_id'>
  ): Promise<MessageContext> {
    return this.sendContact({
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Sends poll to current chat */
  async sendPoll(
    params: Optional<SendPollParams, 'chat_id'>
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
    params: Optional<SendPollParams, 'chat_id'>
  ): Promise<MessageContext> {
    return this.sendPoll({
      reply_to_message_id: this.id,
      ...params
    })
  }

  /** Stops poll in current chat */
  async stopPoll(
    messageId: number,
    params?: Partial<StopPollParams>
  ): Promise<Poll> {
    const response = await this.telegram.api.stopPoll({
      chat_id: this.chatId || this.senderId || 0,
      message_id: messageId,
      ...params
    })

    return new Poll(response)
  }

  /** Sends chat action to current chat */
  sendChatAction(action: SendChatActionParams['action']): Promise<true> {
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
    params?: Optional<SendStickerParams, 'sticker' | 'chat_id'>
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
    emoji: SendDiceParams['emoji'],
    params?: Partial<SendDiceParams>
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
      (command: TelegramBotCommand) => new BotCommand(command)
    )
  }

  // Edit methods

  /** Edits current message text */
  async editMessageText(
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
  async editMessageCaption(
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
  async editMessageMedia(
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
  async editMessageReplyMarkup(
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

interface MessageContext extends Message { }
applyMixins(MessageContext, [Message])

inspectable(MessageContext, {
  serialize(message: MessageContext) {
    const payload = {
      id: message.id,
      from: message.from,
      createdAt: message.createdAt,
      chat: message.chat,
      forwardMessage: message.forwardMessage,
      replyMessage: message.replyMessage,
      viaBot: message.viaBot,
      updatedAt: message.updatedAt,
      mediaGroupId: message.mediaGroupId,
      authorSignature: message.authorSignature,
      text: message.text,
      entities: message.entities,
      captionEntities: message.captionEntities,
      dice: message.dice,
      attachments: message.attachments,
      caption: message.caption,
      contact: message.contact,
      location: message.location,
      venue: message.venue,
      poll: message.poll,
      replyMarkup: message.replyMarkup
    }

    return filterPayload(payload)
  }
})

export { MessageContext }
