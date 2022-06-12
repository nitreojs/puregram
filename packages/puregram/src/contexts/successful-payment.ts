import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import { SuccessfulPayment } from '../common/structures'

import { Message } from '../updates/'
import { Telegram } from '../telegram'
import { applyMixins } from '../utils/helpers'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin } from './mixins'

interface SuccessfulPaymentContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class SuccessfulPaymentContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor(options: SuccessfulPaymentContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'successful_payment',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  clone(options?: SuccessfulPaymentContextOptions) {
    return new SuccessfulPaymentContext({
      telegram: this.telegram,
      payload: this.payload,
      updateId: this.updateId!,
      update: this.update!,
      ...options
    })
  }

  /** Received payment */
  get eventPayment() {
    return new SuccessfulPayment(this.payload.successful_payment!)
  }
}

interface SuccessfulPaymentContext extends Message, TargetMixin, SendMixin, NodeMixin { }
applyMixins(SuccessfulPaymentContext, [Message, TargetMixin, SendMixin, NodeMixin])

inspectable(SuccessfulPaymentContext, {
  serialize(context) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      eventPayment: context.eventPayment
    }
  }
})

export { SuccessfulPaymentContext }
