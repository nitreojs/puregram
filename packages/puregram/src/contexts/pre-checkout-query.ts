import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { filterPayload, applyMixins } from '../utils/helpers'
import { PreCheckoutQuery } from '../updates/'

import { Context } from './context'
import { SendMixin } from './mixins'

interface PreCheckoutQueryContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramPreCheckoutQuery
  updateId: number
}

class PreCheckoutQueryContext extends Context {
  payload: Interfaces.TelegramPreCheckoutQuery

  constructor(options: PreCheckoutQueryContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'pre_checkout_query',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }
}

// @ts-expect-error [senderId: number] is not compatible with [senderId: number | undefined] :shrug:
interface PreCheckoutQueryContext extends PreCheckoutQuery, SendMixin { }
applyMixins(PreCheckoutQueryContext, [PreCheckoutQuery, SendMixin])

inspectable(PreCheckoutQueryContext, {
  serialize(query) {
    const payload = {
      id: query.id,
      from: query.from,
      senderId: query.senderId,
      currency: query.currency,
      totalAmount: query.totalAmount,
      invoicePayload: query.invoicePayload,
      shippingOptionId: query.shippingOptionId,
      orderInfo: query.orderInfo
    }

    return filterPayload(payload)
  }
})

export { PreCheckoutQueryContext }
