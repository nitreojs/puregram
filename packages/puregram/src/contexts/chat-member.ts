import { inspectable } from 'inspectable'

import {
  BotCommand,
  ChatMemberUpdated,
  Poll
} from '../common/structures'

import {
  TelegramBotCommand,
  TelegramChat,
  TelegramChatMemberUpdated,
  TelegramMessage,
  TelegramUpdate
} from '../telegram-interfaces'

import {
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
  StopPollParams
} from '../methods'

import { Telegram } from '../telegram'

import { Optional, UpdateName } from '../types'
import { MediaInput } from '../media-source'

import { applyMixins } from '../utils/helpers'

import { Context } from './context'
import { MessageContext } from './message'

interface ChatMemberContextOptions {
  telegram: Telegram
  update: TelegramUpdate
  payload: TelegramChatMemberUpdated
  updateId: number
  type?: UpdateName
}

class ChatMemberContext extends Context {
  public payload: TelegramChatMemberUpdated

  constructor(options: ChatMemberContextOptions) {
    super({
      telegram: options.telegram,
      updateType: options.type ?? 'chat_member',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Sender's ID */
  public get senderId(): number {
    return this.from.id
  }

  /** Chat ID */
  public get chatId(): number {
    return this.chat.id
  }

  /** Chat type */
  public get chatType(): TelegramChat['type'] | undefined {
    return this.chat.type
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

  /** Does this update have `invite_link` property? */
  public get hasInviteLink(): boolean {
    return this.inviteLink !== undefined
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
}

interface ChatMemberContext extends ChatMemberUpdated { }
applyMixins(ChatMemberContext, [ChatMemberUpdated])

inspectable(ChatMemberContext, {
  serialize(context: ChatMemberContext) {
    return {
      senderId: context.senderId,
      chatId: context.chatId,
      chatType: context.chatType,
      oldChatMember: context.oldChatMember,
      newChatMember: context.newChatMember,
      date: context.date,
      inviteLink: context.inviteLink
    }
  }
})

export { ChatMemberContext }