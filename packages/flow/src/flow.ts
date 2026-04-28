import type { MessageUpdate, UpdateKindMap } from '@puregram/api'
import { createPlugin, type Telegram } from 'puregram'

import { createAugmentMiddleware } from './augment/middleware'
import { MediaGroupBuffer } from './media-group/buffer'
import { createPrompt, type PromptOptions } from './prompt'
import { createWaitForMiddleware } from './wait-for/middleware'
import { WaiterRegistry } from './wait-for/registry'
import type { WaitForOptions } from './wait-for/types'
import { Waiter } from './wait-for/waiter'

export interface FlowOptions {
  /** sliding window in ms used by `collectMediaGroup` to wait for further album messages (default 1000) */
  mediaGroupWindow?: number
}

export interface CollectMediaGroupOptions {
  /** override the plugin-level window for this call only */
  window?: number
}

export interface FlowExtension {
  waitFor: <K extends keyof UpdateKindMap> (
    kind: K,
    options?: WaitForOptions<K>
  ) => Promise<UpdateKindMap[K] | null>
  prompt: (
    chat: number | string,
    text: string,
    options?: PromptOptions
  ) => Promise<UpdateKindMap['message'] | null>
  /**
   * collect every message that shares a `media_group_id` with the given message into one
   * array. resolves once a sliding window of inactivity passes (default 1000ms, override
   * via `flow({ mediaGroupWindow })` or per-call). resolves immediately with `[message]`
   * when the message has no `media_group_id`.
   */
  collectMediaGroup: (
    message: MessageUpdate,
    options?: CollectMediaGroupOptions
  ) => Promise<MessageUpdate[]>
  cancelAll: () => void
}

export function flow (options: FlowOptions = {}) {
  const defaultWindow = options.mediaGroupWindow ?? 1000

  return createPlugin({
    name: 'flow',
    install: (tg: Telegram) => {
      const registry = new WaiterRegistry()
      const buffer = new MediaGroupBuffer()

      const prompt = createPrompt(tg, registry)

      const ext: FlowExtension = {
        waitFor: <K extends keyof UpdateKindMap> (kind: K, options: WaitForOptions<K> = {}) => {
          const waiter = new Waiter<K>(kind, options)

          registry.register(waiter)

          return waiter.promise
        },
        prompt,
        collectMediaGroup: (message, options = {}) => {
          const id = message.raw.media_group_id

          if (id === undefined) {
            return Promise.resolve([message])
          }

          return buffer.collect(id, message, options.window ?? defaultWindow)
        },
        cancelAll: () => {
          registry.cancelAll()
        }
      }

      // augment must register before wait-for so an `update.flow.waitFor(...)`
      // call from inside a high-priority handler still operates on a fully-augmented update
      tg.useHook('onUpdate', createAugmentMiddleware(ext), { priority: 'high' })
      tg.useHook('onUpdate', createWaitForMiddleware(registry, tg), { priority: 'high' })
      tg.useHook('onShutdown', () => {
        registry.cancelAll()
        buffer.flushAll()
      })

      return ext
    }
  })
}
