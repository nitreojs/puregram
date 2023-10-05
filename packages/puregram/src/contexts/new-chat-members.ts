import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import { User, Message } from '../common/structures'

import { Telegram } from '../telegram'
import { applyMixins } from '../utils/helpers'
import { Constructor } from '../types/types'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin, CloneMixin, ChatMemberControlMixin, PinsMixin, ChatControlMixin, ChatInviteControlMixin, ChatSenderControlMixin } from './mixins'

interface NewChatMembersContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class NewChatMembersContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: NewChatMembersContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'new_chat_members',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** New chat members */
  get eventMembers () {
    const members = this.payload.new_chat_members as Interfaces.TelegramUser[]

    return members.map(member => new User(member))
  }
}

interface NewChatMembersContext extends Constructor<NewChatMembersContext>, Message, TargetMixin, SendMixin, NodeMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin<NewChatMembersContext, NewChatMembersContextOptions> { }
applyMixins(NewChatMembersContext, [Message, TargetMixin, SendMixin, NodeMixin, ChatInviteControlMixin, ChatControlMixin, ChatSenderControlMixin, ChatMemberControlMixin, PinsMixin, CloneMixin])

inspectable(NewChatMembersContext, {
  serialize (context) {
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
