import { ChatBoostRemoved } from '../common/structures/chat-boost-removed'
import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { Constructor } from '../types/types'
import { applyMixins } from '../utils/helpers'

import { Context } from './context'
import { CloneMixin, SendMixin } from './mixins'

interface RemovedChatBoostContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramChatBoostRemoved
  updateId: number
}

/** This object represents a boost removed from a chat. */
class RemovedChatBoostContext extends Context {
  payload: Interfaces.TelegramChatBoostRemoved

  constructor (options: RemovedChatBoostContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'removed_chat_boost',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }
}

interface RemovedChatBoostContext extends Constructor<RemovedChatBoostContext>, ChatBoostRemoved, SendMixin, CloneMixin<RemovedChatBoostContext, RemovedChatBoostContextOptions> { }
applyMixins(RemovedChatBoostContext, [ChatBoostRemoved, SendMixin, CloneMixin])

export { RemovedChatBoostContext }
