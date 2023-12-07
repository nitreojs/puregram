import { inspectable } from 'inspectable'

import { applyMixins } from '../utils/helpers'
import { Constructor } from '../types/types'

import * as Interfaces from '../generated/telegram-interfaces'
import { ChatJoinRequest } from '../common/structures'

import { Telegram } from '../telegram'

import { Context } from './context'
import { SendMixin, ChatActionMixin, TargetMixin, CloneMixin, ChatInviteControlMixin } from './mixins'

interface ChatJoinRequestContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramChatJoinRequest
  updateId: number
}

class ChatJoinRequestContext extends Context {
  payload: Interfaces.TelegramChatJoinRequest

  constructor (options: ChatJoinRequestContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'chat_join_request',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Approves chat join request */
  approve () {
    return this.telegram.api.approveChatJoinRequest({
      chat_id: this.chatId,
      user_id: this.userChatId
    })
  }

  /** Declines chat join request */
  decline () {
    return this.telegram.api.declineChatJoinRequest({
      chat_id: this.chatId,
      user_id: this.userChatId
    })
  }
}

// @ts-expect-error [senderId: number] is not compatible with [senderId: number | undefined] :shrug:
interface ChatJoinRequestContext extends Constructor<ChatJoinRequestContext>, ChatJoinRequest, TargetMixin, SendMixin, ChatActionMixin, ChatInviteControlMixin, CloneMixin<ChatJoinRequestContext, ChatJoinRequestContextOptions> { }
applyMixins(ChatJoinRequestContext, [ChatJoinRequest, TargetMixin, SendMixin, ChatActionMixin, ChatInviteControlMixin, CloneMixin])

inspectable(ChatJoinRequestContext, {
  serialize (context) {
    return {
      chat: context.chat,
      from: context.from,
      date: context.date,
      bio: context.bio,
      inviteLink: context.inviteLink
    }
  }
})

export { ChatJoinRequestContext }
