import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { Constructor } from '../types/types'
import { Message } from '../common/structures'
import { applyMixins } from '../utils/helpers'

import { Context } from './context'
import { NodeMixin, SendMixin, ChatActionMixin, TargetMixin, CloneMixin, ChatMemberControlMixin, PinsMixin, ChatControlMixin, ChatInviteControlMixin, ChatSenderControlMixin } from './mixins'

interface ChatBoostAddedContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class ChatBoostAddedContext extends Context {
  payload: Interfaces.TelegramMessage

  private event: Interfaces.TelegramChatBoostAdded

  constructor (options: ChatBoostAddedContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'boost_added',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
    this.event = this.payload.boost_added as Interfaces.TelegramChatBoostAdded
  }

  /** Number of boosts added by the user */
  get boostCount () {
    return this.event.boost_count
  }
}

interface ChatBoostAddedContext extends Constructor<ChatBoostAddedContext>, Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin<ChatBoostAddedContext, ChatBoostAddedContextOptions> { }
applyMixins(ChatBoostAddedContext, [Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin])

inspectable(ChatBoostAddedContext, {
  serialize (context) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      boostCount: context.boostCount
    }
  }
})

export { ChatBoostAddedContext }
