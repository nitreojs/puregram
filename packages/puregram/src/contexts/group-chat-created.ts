import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { Message } from '../updates/'
import { applyMixins } from '../utils/helpers'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin } from './mixins'

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
}

interface GroupChatCreatedContext extends Message, TargetMixin, SendMixin, NodeMixin { }
applyMixins(GroupChatCreatedContext, [Message, TargetMixin, SendMixin, NodeMixin])

inspectable(GroupChatCreatedContext, {
  serialize(context) {
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
