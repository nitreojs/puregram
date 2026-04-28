import type { MessageUpdate, UpdateKindMap } from '@puregram/api'
import type { KVStorage } from '@puregram/storage'
import { createPlugin, type Telegram } from 'puregram'

import { createAugmentMiddleware } from './augment/middleware'
import { FlowPersistenceUnconfigured } from './errors'
import { MediaGroupBuffer } from './media-group/buffer'
import { HandlerRegistry } from './persistent/handlers'
import type { FlowHandleConfig, PersistedFlow } from './persistent/types'
import { createPrompt, type PromptOptions } from './prompt'
import { createWaitForMiddleware } from './wait-for/middleware'
import { WaiterRegistry } from './wait-for/registry'
import type { WaitForOptions } from './wait-for/types'
import { Waiter } from './wait-for/waiter'

export interface FlowOptions {
  /** sliding window in ms used by `collectMediaGroup` to wait for further album messages (default 1000) */
  mediaGroupWindow?: number
  /** required for any flow.prompt({ id }) / flow.waitFor({ id }) usage */
  storage?: KVStorage<PersistedFlow>
  /** ms; applied if a call site does not pass `ttl`. absent + no per-call ttl = no expiry */
  defaultTtl?: number
}

export interface CollectMediaGroupOptions {
  /** override the plugin-level window for this call only */
  window?: number
}

export interface FlowExtension {
  waitFor: <K extends keyof UpdateKindMap, T = UpdateKindMap[K]> (
    kind: K,
    options?: WaitForOptions<K, T> & { id?: string, payload?: unknown, ttl?: number, chatId?: number, fromId?: number }
  ) => Promise<T | null>
  prompt: <K extends keyof UpdateKindMap = 'message', T = UpdateKindMap[K]> (
    chat: number | string,
    text: string,
    options?: PromptOptions<K, T> & { id?: string, payload?: unknown, ttl?: number }
  ) => Promise<T | null>
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
  /**
   * register a persistent flow handler. matched by `id` against persisted records on
   * incoming updates; the registered config drives validate/transform/onAnswer/onTimeout
   */
  handle: <K extends keyof UpdateKindMap = 'message', T = UpdateKindMap[K]> (
    id: string,
    config: FlowHandleConfig<K, T>
  ) => void
  cancelAll: () => void
}

export function flow (options: FlowOptions = {}) {
  const defaultWindow = options.mediaGroupWindow ?? 1000
  const storage = options.storage

  return createPlugin({
    name: 'flow',
    install: (tg: Telegram) => {
      const registry = new WaiterRegistry()
      const buffer = new MediaGroupBuffer()
      const handlerRegistry = new HandlerRegistry()

      const inMemoryPrompt = createPrompt(tg, registry)

      const ext: FlowExtension = {
        waitFor: async <K extends keyof UpdateKindMap, T = UpdateKindMap[K]> (
          kind: K,
          opts: WaitForOptions<K, T> & { id?: string } = {}
        ): Promise<T | null> => {
          if (opts.id !== undefined) {
            if (storage === undefined) {
              throw new FlowPersistenceUnconfigured()
            }

            // wired in section J — until then opting in to persistence throws so the gap is visible
            throw new Error('persistent waitFor path not wired (section J)')
          }

          const waiter = new Waiter<K, T>(kind, opts)

          registry.register(waiter)

          return waiter.promise
        },
        prompt: async <K extends keyof UpdateKindMap = 'message', T = UpdateKindMap[K]> (
          chat: number | string,
          text: string,
          opts: PromptOptions<K, T> & { id?: string } = {}
        ): Promise<T | null> => {
          if (opts.id !== undefined) {
            if (storage === undefined) {
              throw new FlowPersistenceUnconfigured()
            }

            throw new Error('persistent prompt path not wired (section J)')
          }

          return inMemoryPrompt<K, T>(chat, text, opts)
        },
        collectMediaGroup: (message, opts = {}) => {
          const id = message.raw.media_group_id

          if (id === undefined) {
            return Promise.resolve([message])
          }

          return buffer.collect(id, message, opts.window ?? defaultWindow)
        },
        handle: (id, config) => {
          handlerRegistry.register(id, config)
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
