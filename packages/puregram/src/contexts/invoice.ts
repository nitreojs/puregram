import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import { Invoice } from '../common/structures'

import { Telegram } from '../telegram'
import { Message } from '../updates/'
import { applyMixins } from '../utils/helpers'

import { Context } from './context'
import { NodeMixin, SendMixin, TargetMixin } from './mixins'

interface InvoiceContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramMessage
  updateId: number
}

class InvoiceContext extends Context {
  payload: Interfaces.TelegramMessage

  constructor(options: InvoiceContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'invoice',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }

  /** Invoice */
  get eventInvoice() {
    return new Invoice(this.payload.invoice!)
  }
}

interface InvoiceContext extends Message, TargetMixin, SendMixin, NodeMixin { }
applyMixins(InvoiceContext, [Message, TargetMixin, SendMixin, NodeMixin])

inspectable(InvoiceContext, {
  serialize(context: InvoiceContext) {
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
