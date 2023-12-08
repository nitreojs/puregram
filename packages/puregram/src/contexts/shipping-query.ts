import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'
import * as Methods from '../generated/methods'

import { Telegram } from '../telegram'
import { filterPayload, applyMixins } from '../utils/helpers'
import { Constructor, Optional } from '../types/types'
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

  /** Replies to shipping queries */
  answerShippingQuery <Ok extends boolean> (
    ok: Ok = true as Ok,
    params?: Optional<Methods.AnswerShippingQueryParams, 'shipping_query_id' | 'ok'>
      & Required<Pick<Methods.AnswerShippingQueryParams, true extends Ok ? 'shipping_options' : 'error_message'>>
  ) {
    return this.telegram.api.answerShippingQuery({
      shipping_query_id: this.id,
      ok,
      ...params
    })
  }

  /** Replies to shipping queries. An alias for `answerShippingQuery` */
  answer <Ok extends boolean> (
    ok: Ok = true as Ok,
    params?: Optional<Methods.AnswerShippingQueryParams, 'shipping_query_id' | 'ok'>
      & Required<Pick<Methods.AnswerShippingQueryParams, true extends Ok ? 'shipping_options' : 'error_message'>>
  ) {
    return this.answerShippingQuery(ok, params)
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
