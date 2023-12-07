import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import { SuccessfulPayment, Message } from '../common/structures'

import { Telegram } from '../telegram'
import { applyMixins } from '../utils/helpers'
import { Constructor } from '../types/types'

import { Context } from './context'
import { NodeMixin, SendMixin, ChatActionMixin, TargetMixin, CloneMixin, PinsMixin } from './mixins'

interface SuccessfulPaymentContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class SuccessfulPaymentContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: SuccessfulPaymentContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'successful_payment',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Received payment */
  get eventPayment () {
    return new SuccessfulPayment(this.payload.successful_payment as Interfaces.TelegramSuccessfulPayment)
  }
}

interface SuccessfulPaymentContext extends Constructor<SuccessfulPaymentContext>, Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, PinsMixin, CloneMixin<SuccessfulPaymentContext, SuccessfulPaymentContextOptions> { }
applyMixins(SuccessfulPaymentContext, [Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, PinsMixin, CloneMixin])

inspectable(SuccessfulPaymentContext, {
  serialize (context) {
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
