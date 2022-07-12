import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import { User } from '../common/structures'

import { Telegram } from '../telegram'
import { Message } from '../updates/'
import { applyMixins } from '../utils/helpers'
import { Constructor } from '../types/types'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin, CloneMixin } from './mixins'

interface LeftChatMemberContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class LeftChatMemberContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: LeftChatMemberContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'left_chat_member',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Left chat member */
  get eventMember () {
    return new User(this.payload.left_chat_member as Interfaces.TelegramUser)
  }
}

interface LeftChatMemberContext extends Constructor<LeftChatMemberContext>, Message, TargetMixin, SendMixin, NodeMixin, CloneMixin<LeftChatMemberContext, LeftChatMemberContextOptions> { }
applyMixins(LeftChatMemberContext, [Message, TargetMixin, SendMixin, NodeMixin, CloneMixin])

inspectable(LeftChatMemberContext, {
  serialize (context) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      eventMember: context.eventMember
    }
  }
})

export { LeftChatMemberContext }
