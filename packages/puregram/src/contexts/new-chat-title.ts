import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { Message } from '../updates/'
import { applyMixins } from '../utils/helpers'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin } from './mixins'

interface NewChatTitleContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class NewChatTitleContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor(options: NewChatTitleContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'new_chat_title',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** New chat title */
  get eventTitle() {
    return this.payload.new_chat_title!
  }
}

interface NewChatTitleContext extends Message, TargetMixin, SendMixin, NodeMixin { }
applyMixins(NewChatTitleContext, [Message, TargetMixin, SendMixin, NodeMixin])

inspectable(NewChatTitleContext, {
  serialize(context: NewChatTitleContext) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      eventTitle: context.eventTitle
    }
  }
})

export { NewChatTitleContext }
