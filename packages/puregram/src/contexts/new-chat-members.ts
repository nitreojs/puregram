import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import { User } from '../common/structures'

import { Telegram } from '../telegram'
import { Message } from '../updates/'
import { applyMixins } from '../utils/helpers'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin } from './mixins'

interface NewChatMembersContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class NewChatMembersContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor(options: NewChatMembersContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'new_chat_members',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  clone(options?: NewChatMembersContextOptions) {
    return new NewChatMembersContext({
      telegram: this.telegram,
      payload: this.payload,
      updateId: this.updateId!,
      update: this.update!,
      ...options
    })
  }

  /** New chat members */
  get eventMembers() {
    return this.payload.new_chat_members!.map(
      (member: Interfaces.TelegramUser) => new User(member)
    )
  }
}

interface NewChatMembersContext extends Message, TargetMixin, SendMixin, NodeMixin { }
applyMixins(NewChatMembersContext, [Message, TargetMixin, SendMixin, NodeMixin])

inspectable(NewChatMembersContext, {
  serialize(context) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      eventMembers: context.eventMembers
    }
  }
})

export { NewChatMembersContext }
