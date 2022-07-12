import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { Constructor } from '../types/types'
import { Message } from '../updates/'
import { applyMixins } from '../utils/helpers'

import { Context } from './context'
import { MessageContext } from './message'
import { NodeMixin, SendMixin, TargetMixin, CloneMixin } from './mixins'

interface PinnedMessageContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class PinnedMessageContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: PinnedMessageContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'pinned_message',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Pinned message */
  get eventMessage () {
    return new MessageContext({
      telegram: this.telegram,
      payload: this.payload.pinned_message as Interfaces.TelegramMessage
    })
  }
}

interface PinnedMessageContext extends Constructor<PinnedMessageContext>, Message, TargetMixin, SendMixin, NodeMixin, CloneMixin<PinnedMessageContext, PinnedMessageContextOptions> { }
applyMixins(PinnedMessageContext, [Message, TargetMixin, SendMixin, NodeMixin, CloneMixin])

inspectable(PinnedMessageContext, {
  serialize (context) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      eventMessage: context.eventMessage
    }
  }
})

export { PinnedMessageContext }
