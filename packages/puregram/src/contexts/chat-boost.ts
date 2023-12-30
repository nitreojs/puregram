import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { Constructor } from '../types/types'
import { applyMixins } from '../utils/helpers'
import { ChatBoostUpdated } from '../common/structures/chat-boost-updated'

import { Context } from './context'
import { CloneMixin, SendMixin } from './mixins'
import { inspectable } from 'inspectable'

interface ChatBoostContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramChatBoostUpdated
  updateId: number
}

/** This object represents a boost added to a chat or changed. */
class ChatBoostContext extends Context {
  payload: Interfaces.TelegramChatBoostUpdated

  constructor (options: ChatBoostContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'chat_boost',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }
}

interface ChatBoostContext extends Constructor<ChatBoostContext>, ChatBoostUpdated, SendMixin, CloneMixin<ChatBoostContext, ChatBoostContextOptions> { }
applyMixins(ChatBoostContext, [ChatBoostUpdated, SendMixin, CloneMixin])

export { ChatBoostContext }

inspectable(ChatBoostContext, {
  serialize (context: ChatBoostContext) {
    const payload = {
      chat: context.chat,
      boost: context.boost
    }

    return payload
  }
})
