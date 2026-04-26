import type { MessageUpdate } from '@puregram/api'
import type { Telegram } from 'puregram'

import type { WaiterRegistry } from './wait-for/registry'
import type { WaitForOptions } from './wait-for/types'
import { Waiter } from './wait-for/waiter'

export interface PromptOptions extends Omit<WaitForOptions<'message'>, 'filter'> {
  /** restrict to replies from this user id */
  from?: number
  /** additional filter on the matched message; combined with `from` via AND */
  filter?: (update: MessageUpdate) => boolean
}

export function createPrompt (tg: Telegram, registry: WaiterRegistry) {
  return async function prompt (
    chat: number | string,
    text: string,
    options: PromptOptions = {}
  ) {
    await tg.send(chat, text)

    const callerFilter = options.filter
    const expectedFrom = options.from

    const waiterOptions: WaitForOptions<'message'> = {
      filter: m => {
        // chat scoping is mandatory: prompt is per-chat
        if (m.chat?.id !== chat) {
          return false
        }

        if (expectedFrom !== undefined && m.from?.id !== expectedFrom) {
          return false
        }

        if (callerFilter !== undefined && !callerFilter(m)) {
          return false
        }

        return true
      }
    }

    if (options.timeout !== undefined) {
      waiterOptions.timeout = options.timeout
    }

    if (options.nullOnTimeout !== undefined) {
      waiterOptions.nullOnTimeout = options.nullOnTimeout
    }

    if (options.consume !== undefined) {
      waiterOptions.consume = options.consume
    }

    const waiter = new Waiter<'message'>('message', waiterOptions)

    registry.register(waiter)

    return waiter.promise
  }
}
