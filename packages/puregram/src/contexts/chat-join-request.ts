import { inspectable } from 'inspectable'

import { applyMixins } from '../utils/helpers'
import { Constructor } from '../types/types'

import * as Interfaces from '../generated/telegram-interfaces'
import { ChatJoinRequest } from '../common/structures'

import { Telegram } from '../telegram'

import { Context } from './context'
import { SendMixin, TargetMixin, CloneMixin } from './mixins'

interface ChatJoinRequestContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramChatJoinRequest
  updateId: number
}

class ChatJoinRequestContext extends Context {
  payload: Interfaces.TelegramChatJoinRequest

  constructor(options: ChatJoinRequestContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'chat_join_request',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }
}

// @ts-expect-error [senderId: number] is not compatible with [senderId: number | undefined] :shrug:
interface ChatJoinRequestContext extends Constructor<ChatJoinRequestContext>, ChatJoinRequest, TargetMixin, SendMixin, CloneMixin<ChatJoinRequestContext, ChatJoinRequestContextOptions> { }
applyMixins(ChatJoinRequestContext, [ChatJoinRequest, TargetMixin, SendMixin, CloneMixin])

inspectable(ChatJoinRequestContext, {
  serialize(context) {
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
