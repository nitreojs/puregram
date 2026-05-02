import { isTtlStorage, type KVStorage, MemoryStorage } from '@puregram/storage'
import { createPlugin, type Telegram } from 'puregram'

import { wrap } from './proxy'
import type { TtlData } from './ttl'
import type { AnyUpdate, SessionContext, SessionOptions } from './types'

interface KeyResolvable {
  from?: { id?: number | string }
  senderChat?: { id?: number | string }
  chat?: { id?: number | string }
}

const defaultGetStorageKey = (update: AnyUpdate) => {
  const u = update as KeyResolvable
  const fromId = u.from?.id

  if (fromId !== undefined) {
    return String(fromId)
  }

  const senderChatId = u.senderChat?.id

  if (senderChatId !== undefined) {
    return String(senderChatId)
  }

  const chatId = u.chat?.id

  if (chatId !== undefined) {
    return String(chatId)
  }

  return undefined
}

/** direct storage handle exposed as `tg.session` — methods proxy to the configured `KVStorage<unknown>` */
export interface SessionExtension {
  get: (key: string) => Promise<unknown>
  set: (key: string, value: unknown) => Promise<void>
  delete: (key: string) => Promise<void>
  has: (key: string) => Promise<boolean>
}

export function session (options: SessionOptions = {}) {
  const storage: KVStorage<unknown> = options.storage ?? new MemoryStorage<unknown>()
  const getStorageKey = options.getStorageKey ?? defaultGetStorageKey
  const initial = options.initial ?? (() => ({}))

  return createPlugin({
    name: 'session',
    install: (tg: Telegram) => {
      tg.useHook('onUpdate', async (update, next) => {
        const key = getStorageKey(update as AnyUpdate)

        if (key === undefined) {
          await next()

          return
        }

        const ttlMap = new Map<string, TtlData>()
        let changed = false

        const onChange = () => {
          changed = true
        }

        const stored = await storage.get(key)
        const sessionData: Record<string, unknown> = stored !== undefined
          ? stored as Record<string, unknown>
          : initial(update as AnyUpdate) as Record<string, unknown>

        const $forceUpdate = async () => {
          if (Object.keys(sessionData).length !== 0) {
            changed = false
            await storage.set(key, sessionData)

            return
          }

          await storage.delete(key)
        }

        const proxy = wrap(sessionData, $forceUpdate, ttlMap, onChange) as SessionContext

        Object.defineProperty(update, 'session', {
          value: proxy,
          enumerable: true,
          configurable: false
        })

        await next()

        if (changed || stored === undefined) {
          await $forceUpdate()
        } else if (isTtlStorage(storage)) {
          await storage.touch(key)
        }
      }, { priority: 'high' })

      const ext: SessionExtension = {
        get: (key: string) => storage.get(key),
        set: (key: string, value: unknown) => storage.set(key, value),
        delete: (key: string) => storage.delete(key),
        has: (key: string) => storage.has(key)
      }

      return ext
    }
  })
}
