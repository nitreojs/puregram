import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { filterPayload, applyMixins } from '../utils/helpers'
import { Constructor } from '../types/types'
import { ShippingQuery } from '../common/structures'

import { Context } from './context'
import { SendMixin, ChatActionMixin, CloneMixin } from './mixins'

interface ShippingQueryContextOptions {
  telegram: Telegram
  update: Interfaces.TelegramUpdate
  payload: Interfaces.TelegramShippingQuery
  updateId: number
}

class ShippingQueryContext extends Context {
  payload: Interfaces.TelegramShippingQuery

  constructor (options: ShippingQueryContextOptions) {
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
interface ShippingQueryContext extends Constructor<ShippingQueryContext>, ShippingQuery, SendMixin, ChatActionMixin, CloneMixin<ShippingQueryContext, ShippingQueryContextOptions> { }
applyMixins(ShippingQueryContext, [ShippingQuery, SendMixin, ChatActionMixin, CloneMixin])

inspectable(ShippingQueryContext, {
  serialize (context) {
    const payload = {
      id: context.id,
      from: context.from,
      senderId: context.senderId,
      invoicePayload: context.invoicePayload,
      shippingAddress: context.shippingAddress
    }

    return filterPayload(payload)
  }
})

export { ShippingQueryContext }
