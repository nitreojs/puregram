import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { filterPayload, applyMixins } from '../utils/helpers'
import { ShippingQuery, Poll } from '../updates/'

import { Context } from './context'
import { SendMixin } from './mixins'

interface ShippingQueryContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramShippingQuery
  updateId: number
}

class ShippingQueryContext extends Context {
  payload: Interfaces.TelegramShippingQuery

  constructor(options: ShippingQueryContextOptions) {
    super({
      telegram: options.telegram,
      updateType: 'shipping_query',
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }
}

// @ts-expect-error [senderId: number] is not compatible with [senderId: number | undefined] :shrug:
interface ShippingQueryContext extends ShippingQuery, SendMixin { }
applyMixins(ShippingQueryContext, [ShippingQuery, SendMixin])

inspectable(ShippingQueryContext, {
  serialize(query) {
    const payload = {
      id: query.id,
      from: query.from,
      senderId: query.senderId,
      invoicePayload: query.invoicePayload,
      shippingAddress: query.shippingAddress
    }

    return filterPayload(payload)
  }
})

export { ShippingQueryContext }
