import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { Constructor } from '../types/types'
import { Message } from '../common/structures'
import { applyMixins } from '../utils/helpers'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin, CloneMixin, ChatMemberControlMixin } from './mixins'

interface GroupChatCreatedContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class GroupChatCreatedContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: GroupChatCreatedContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'group_chat_created',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }
}

interface GroupChatCreatedContext extends Constructor<GroupChatCreatedContext>, Message, TargetMixin, SendMixin, NodeMixin, ChatMemberControlMixin, CloneMixin<GroupChatCreatedContext, GroupChatCreatedContextOptions> { }
applyMixins(GroupChatCreatedContext, [Message, TargetMixin, SendMixin, NodeMixin, ChatMemberControlMixin, CloneMixin])

inspectable(GroupChatCreatedContext, {
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

export { GroupChatCreatedContext }
