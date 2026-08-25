import type { UpdateKindMap } from '@puregram/api'
import type { Telegram } from 'puregram'

import { FlowChatIdNotNumeric } from './errors'
import type { WaiterRegistry } from './wait-for/registry'
import type { Filter, WaitForOptions } from './wait-for/types'
import { Waiter } from './wait-for/waiter'

export interface PromptOptions<K extends keyof UpdateKindMap = 'message', T = UpdateKindMap[K]>
  extends Omit<WaitForOptions<K, T>, 'filter'> {
  /** which update kind closes this prompt; default 'message' */
  kind?: K
  /** restrict to replies from this user id (also used as fromId on the persistent path) */
  from?: number
  /** additional filter on the matched update; combined with chat / from via AND */
  filter?: Filter<UpdateKindMap[K]>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bot api shape lives in @puregram/api codegen
  reply_markup?: any
}

interface ChatLike {
  chat?: { id?: number | string }
  message?: { chat?: { id?: number | string } }
}

interface FromLike {
  from?: { id?: number | string }
}

function chatIdOf (update: unknown) {
  const u = update as ChatLike

  return u.chat?.id ?? u.message?.chat?.id
}

function fromIdOf (update: unknown) {
  return (update as FromLike).from?.id
}

export function createPrompt (tg: Telegram, registry: WaiterRegistry) {
  return async function prompt <K extends keyof UpdateKindMap = 'message', T = UpdateKindMap[K]> (
    chat: number | string,
    text: string,
    options: PromptOptions<K, T> = {}
  ) {
    const kind = (options.kind ?? 'message') as K

    // chatIdOf reads a numeric id off the wire, so a string would build an unmatchable waiter
    if (typeof chat !== 'number') {
      throw new FlowChatIdNotNumeric(typeof chat)
    }

    const callerFilter = options.filter
    const expectedFrom = options.from

    const waiterOptions: WaitForOptions<K, T> = {
      filter: (u) => {
        if (chatIdOf(u) !== chat) {
          return false
        }

        if (expectedFrom !== undefined && fromIdOf(u) !== expectedFrom) {
          return false
        }

        if (callerFilter !== undefined && !callerFilter(u)) {
          return false
        }

        return true
      }
    }

    if (options.consume !== undefined) {
      waiterOptions.consume = options.consume
    }

    if (options.validate !== undefined) {
      waiterOptions.validate = options.validate
    }

    if (options.transform !== undefined) {
      waiterOptions.transform = options.transform
    }

    if (options.signal !== undefined) {
      waiterOptions.signal = options.signal
    }

    const waiter = new Waiter<K, T>(kind, waiterOptions)

    // registering after the send would drop a reply that lands while it is still in flight
    registry.register(waiter)

    // a cancelAll inside the send window rejects this before the caller ever awaits it
    waiter.promise.catch(() => {})

    try {
      if (options.reply_markup !== undefined) {
        // bot api markup shape uses snake_case keys; flatten via Record<string, unknown>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/naming-convention
        const sendParams: Record<string, unknown> = { reply_markup: options.reply_markup }

        await tg.send(chat, text, sendParams)
      } else {
        await tg.send(chat, text)
      }
    } catch (error) {
      waiter.cancel()

      throw error
    }

    // armed after delivery so a flood-wait retry on the send cannot eat the reply budget
    if (options.timeout !== undefined) {
      waiter.armTimeout(options.timeout, options.nullOnTimeout === true)
    }

    return waiter.promise
  }
}
