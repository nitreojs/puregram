import type { UpdateKindMap } from '@puregram/api'
import { createPlugin, type Telegram } from 'puregram'

import { createAugmentMiddleware } from './augment/middleware'
import { createPrompt, type PromptOptions } from './prompt'
import { createWaitForMiddleware } from './wait-for/middleware'
import { WaiterRegistry } from './wait-for/registry'
import type { WaitForOptions } from './wait-for/types'
import { Waiter } from './wait-for/waiter'

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
  cancelAll: () => void
}

export function flow () {
  return createPlugin({
    name: 'flow',
    install: (tg: Telegram) => {
      const registry = new WaiterRegistry()

      const prompt = createPrompt(tg, registry)

      const ext: FlowExtension = {
        waitFor: <K extends keyof UpdateKindMap> (kind: K, options: WaitForOptions<K> = {}) => {
          const waiter = new Waiter<K>(kind, options)

          registry.register(waiter)

          return waiter.promise
        },
        prompt,
        cancelAll: () => {
          registry.cancelAll()
        }
      }

      // augment must register before wait-for so an `update.flow.waitFor(...)`
      // call from inside a high-priority handler still operates on a fully-augmented update
      tg.useHook('onUpdate', createAugmentMiddleware(ext), { priority: 'high' })
      tg.useHook('onUpdate', createWaitForMiddleware(registry), { priority: 'high' })
      tg.useHook('onShutdown', () => {
        registry.cancelAll()
      })

      return ext
    }
  })
}
