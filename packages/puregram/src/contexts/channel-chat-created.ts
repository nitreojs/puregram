import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { Message } from '../common/structures'

import { applyMixins } from '../utils/helpers'
import { Constructor } from '../types/types'

import { Context } from './context'
import { CloneMixin, NodeMixin, SendMixin, TargetMixin } from './mixins'

interface ChannelChatCreatedContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class ChannelChatCreatedContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: ChannelChatCreatedContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'channel_chat_created',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Unique message identifier inside this chat */
  get id () {
    return this.payload.message_id
  }

  /** Date the message was sent in Unix time */
  get createdAt () {
    return this.payload.date
  }
}

interface ChannelChatCreatedContext extends Constructor<ChannelChatCreatedContext>, Message, SendMixin, TargetMixin, NodeMixin, CloneMixin<ChannelChatCreatedContext, ChannelChatCreatedContextOptions> { }
applyMixins(ChannelChatCreatedContext, [Message, TargetMixin, SendMixin, NodeMixin, CloneMixin])

inspectable(ChannelChatCreatedContext, {
  serialize (context) {
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

export { ChannelChatCreatedContext }
