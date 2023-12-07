import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import { Invoice, Message } from '../common/structures'

import { Telegram } from '../telegram'
import { applyMixins } from '../utils/helpers'
import { Constructor } from '../types/types'

import { Context } from './context'
import { NodeMixin, SendMixin, ChatActionMixin, TargetMixin, CloneMixin, PinsMixin } from './mixins'

interface InvoiceContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class InvoiceContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor (options: InvoiceContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'invoice',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Invoice */
  get eventInvoice () {
    return new Invoice(this.payload.invoice as Interfaces.TelegramInvoice)
  }
}

interface InvoiceContext extends Constructor<InvoiceContext>, Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, PinsMixin, CloneMixin<InvoiceContext, InvoiceContextOptions> { }
applyMixins(InvoiceContext, [Message, TargetMixin, SendMixin, ChatActionMixin, NodeMixin, PinsMixin, CloneMixin])

inspectable(InvoiceContext, {
  serialize (context) {
    return {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      createdAt: context.createdAt,
      chat: context.chat,
      chatId: context.chatId,
      chatType: context.chatType,
      eventInvoice: context.eventInvoice
    }
  }
})

export { InvoiceContext }
