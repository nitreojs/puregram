import { inspectable } from 'inspectable'

import { applyMixins } from '../utils/helpers'
import { Telegram } from '../telegram'

import * as Interfaces from '../generated/telegram-interfaces'
import { ChatJoinRequest } from '../common/structures'

import { Context } from './context'
import { SendMixin, TargetMixin } from './mixins'

interface ChatJoinRequestContextParams {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramChatJoinRequest
  updateId: number
}

class ChatJoinRequestContext extends Context {
  payload: Interfaces.TelegramChatJoinRequest

  constructor(options: ChatJoinRequestContextParams) {
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
interface ChatJoinRequestContext extends ChatJoinRequest, TargetMixin, SendMixin { }
applyMixins(ChatJoinRequestContext, [ChatJoinRequest, TargetMixin, SendMixin])

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
