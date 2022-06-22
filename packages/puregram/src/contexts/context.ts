import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { MaybeArray, SoftString, UpdateName } from '../types/types'
import { SERVICE_MESSAGE_EVENTS } from '../utils/constants'

interface ContextOptions {
  telegram: Telegram
  update?: Interfaces.TelegramUpdate
  updateType: UpdateName
  updateId?: number
}

export class Context {
  telegram: Telegram
  updateId?: number
  update?: Interfaces.TelegramUpdate

  protected updateType: UpdateName

  constructor(options: ContextOptions) {
    this.telegram = options.telegram
    this.updateType = options.updateType
    this.updateId = options.updateId
    this.update = options.update
  }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  is(rawTypes: MaybeArray<SoftString<UpdateName>>) {
    const types = Array.isArray(rawTypes)
      ? rawTypes
      : [rawTypes]

    if (types.includes('service_message')) {
      types.push(...SERVICE_MESSAGE_EVENTS)
    }

    return types.includes(this.updateType)
  }
}

inspectable(Context, {
  serialize(context) {
    return {}
  }
})
