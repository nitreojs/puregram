import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import * as Methods from '../generated/methods'
import { BotCommand, ChatMemberUpdated, Poll } from '../common/structures'

import { Telegram } from '../telegram'
import { Optional, UpdateName } from '../types/types'
import { MediaInput } from '../media-source'
import { applyMixins } from '../utils/helpers'

import { Context } from './context'
import { MessageContext } from './message'

interface ChatMemberContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramChatMemberUpdated
  updateId: number
  type?: UpdateName
}

class ChatMemberContext extends Context {
  payload: Interfaces.TelegramChatMemberUpdated

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
  get senderId() {
    return this.from.id
  }

  /** Chat ID */
  get chatId() {
    return this.chat.id
  }

  /** Chat type */
  get chatType() {
    return this.chat.type
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

  /** Does this update have `invite_link` property? */
  get hasInviteLink() {
    return this.inviteLink !== undefined
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