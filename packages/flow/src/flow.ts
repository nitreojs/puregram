import type { UpdateKindMap } from '@puregram/api'
import { createPlugin, type Telegram } from 'puregram'

import { createWaitForMiddleware } from './wait-for/middleware'
import { WaiterRegistry } from './wait-for/registry'
import type { WaitForOptions } from './wait-for/types'
import { Waiter } from './wait-for/waiter'

export interface FlowExtension {
  waitFor: <K extends keyof UpdateKindMap> (
    kind: K,
    options?: WaitForOptions<K>
  ) => Promise<UpdateKindMap[K] | null>
  cancelAll: () => void
}

export function flow () {
  return createPlugin({
    name: 'flow',
    install: (tg: Telegram) => {
      const registry = new WaiterRegistry()

      tg.useHook('onUpdate', createWaitForMiddleware(registry), { priority: 'high' })
      tg.useHook('onShutdown', () => {
        registry.cancelAll()
      })

      return {
        waitFor: <K extends keyof UpdateKindMap> (kind: K, options: WaitForOptions<K> = {}) => {
          const waiter = new Waiter<K>(kind, options)

          registry.register(waiter)

          return waiter.promise
        },
        cancelAll: () => {
          registry.cancelAll()
        }
      }
    }
  })
}
