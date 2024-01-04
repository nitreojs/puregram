import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import { User, Message } from '../common/structures'

import { Telegram } from '../telegram'
import { applyMixins, memoizeGetters } from '../utils/helpers'
import { Constructor } from '../types/types'

import { Context } from './context'
import { NodeMixin, SendMixin, ChatActionMixin, TargetMixin, CloneMixin, ChatMemberControlMixin, PinsMixin, ChatControlMixin, ChatInviteControlMixin, ChatSenderControlMixin } from './mixins'

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

interface LeftChatMemberContext extends Constructor<LeftChatMemberContext>, Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin<LeftChatMemberContext, LeftChatMemberContextOptions> { }
applyMixins(LeftChatMemberContext, [Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin])
memoizeGetters(LeftChatMemberContext, ['eventMember'])

inspectable(LeftChatMemberContext, {
  serialize (context) {
    return {
      id: context.id,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      eventMember: context.eventMember
    }
  }
})

export { LeftChatMemberContext }
