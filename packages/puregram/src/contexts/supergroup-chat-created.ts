import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Message } from '../updates/'
import { Telegram } from '../telegram'
import { applyMixins } from '../utils/helpers'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin } from './mixins'

interface SupergroupChatCreatedContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class SupergroupChatCreatedContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor(options: SupergroupChatCreatedContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'supergroup_chat_created',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }
}

interface SupergroupChatCreatedContext extends Message, TargetMixin, SendMixin, NodeMixin { }
applyMixins(SupergroupChatCreatedContext, [Message, TargetMixin, SendMixin, NodeMixin])

inspectable(SupergroupChatCreatedContext, {
  serialize(context: SupergroupChatCreatedContext) {
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

export { SupergroupChatCreatedContext }
