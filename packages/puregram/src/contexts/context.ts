import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { SERVICE_MESSAGE_EVENTS } from '../utils/constants'

import type { ContextsMapping } from '../types/mappings'
import type { MaybeArray, SoftString, UpdateName } from '../types/types'

interface ContextOptions {
  telegram: Telegram
  update?: Interfaces.TelegramUpdate
  updateType: UpdateName | 'unknown'
  updateId?: number
}

class Context {
  telegram: Telegram
  updateId?: number
  update?: Interfaces.TelegramUpdate

  protected updateType: UpdateName | 'unknown'

  constructor (options: ContextOptions) {
    this.telegram = options.telegram
    this.updateType = options.updateType
    this.updateId = options.updateId
    this.update = options.update
  }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  is <T extends UpdateName> (rawTypes: MaybeArray<SoftString<T>>): this is ContextsMapping[T] {
    const types = Array.isArray(rawTypes)
      ? rawTypes
      : [rawTypes]

    // TODO: it is interfering, make 'subTypes' logic maybe?
    if (types.includes('service_message')) {
      types.push(...SERVICE_MESSAGE_EVENTS)
    }

    return types.includes(this.updateType)
  }
}

inspectable(Context, {
  serialize (context) {
    return {}
  }
})

export { Context }
