import { inspectable } from 'inspectable'

import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { MaybeArray, UpdateName } from '../types/types'

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

  is(rawTypes: MaybeArray<UpdateName | string>) {
    const types = Array.isArray(rawTypes)
      ? rawTypes
      : [rawTypes]

    return types.includes(this.updateType)
  }
}

inspectable(Context, {
  serialize(context) {
    return {}
  }
})
