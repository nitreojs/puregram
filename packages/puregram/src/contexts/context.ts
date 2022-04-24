import { inspectable } from 'inspectable'

import { Telegram } from '../telegram'
import { TelegramUpdate } from '../telegram-interfaces'
import { UpdateName } from '../types'

type AllowArray<T> = T | T[]

interface ContextOptions {
  telegram: Telegram
  update?: TelegramUpdate
  updateType: UpdateName
  updateId?: number
}

export class Context {
  telegram: Telegram
  updateId?: number
  update?: TelegramUpdate

  protected updateType: UpdateName

  constructor(options: ContextOptions) {
    this.telegram = options.telegram
    this.updateType = options.updateType
    this.updateId = options.updateId
    this.update = options.update
  }

  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  is(
    rawTypes: AllowArray<UpdateName | string>
  ): boolean {
    const types = Array.isArray(rawTypes)
      ? rawTypes
      : [rawTypes]

    return types.includes(this.updateType)
  }
}

inspectable(Context, {
  serialize(context: Context) {
    return {}
  }
})
