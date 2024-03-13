import * as Interfaces from '../generated/telegram-interfaces'

import { Telegram } from '../telegram'
import { Constructor, UpdateName } from '../types/types'
import { Context } from './context'

interface UnsupportedContextOptions {
  telegram: Telegram
  type: UpdateName
  update: Interfaces.TelegramUpdate
  payload: Record<string, unknown>
  updateId: number
}

/** This class represents an unsupported context. Yeah, a context that puregram has no idea how to resolve for now. Cool. */
class UnsupportedContext extends Context {
  payload: Record<string, unknown>

  constructor (options: UnsupportedContextOptions) {
    super({
      telegram: options.telegram,
      updateType: options.type,
      updateId: options.updateId,
      update: options.update
    })

    this.payload = options.payload
  }
}

interface UnsupportedContext extends Constructor<UnsupportedContext> { }

export { UnsupportedContext }
