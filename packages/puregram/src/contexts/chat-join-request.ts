import { inspectable } from 'inspectable'

import { ChatJoinRequest } from '../common/structures/chat-join-request'
import { applyMixins } from '../utils/helpers'

import { Telegram } from '../telegram'
import { TelegramChat, TelegramChatJoinRequest, TelegramUpdate } from '../telegram-interfaces'

import { Context } from './context'

interface ChatJoinRequestContextParams {
  telegram: Telegram
  update: TelegramUpdate
  payload: TelegramChatJoinRequest
  updateId: number
}

class ChatJoinRequestContext extends Context {
  public payload: TelegramChatJoinRequest

  constructor(options: ChatJoinRequestContextParams) {
    super({
      telegram: options.telegram,
      updateType: 'delete_chat_photo',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Sender's ID */
  public get senderId(): number | undefined {
    return this.from?.id
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
}

interface ChatJoinRequestContext extends ChatJoinRequest { }
applyMixins(ChatJoinRequestContext, [ChatJoinRequest])

inspectable(ChatJoinRequestContext, {
  serialize(context: ChatJoinRequestContext) {
    return {
      chat: context.chat,
      from: context.from,
      date: context.date,
      bio: context.bio,
      inviteLink: context.inviteLink
    }
  }
})

export { ChatJoinRequestContext }
