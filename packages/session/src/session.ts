import { createPlugin, type Telegram } from 'puregram'

import { wrap } from './proxy'
import { MemoryStorage } from './storage/memory'
import type { SessionStorage } from './storage/storage'
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

export interface SessionExtension {
  get: (key: string) => Promise<unknown>
  set: (key: string, value: unknown) => Promise<boolean>
  delete: (key: string) => Promise<boolean>
}

export function session (options: SessionOptions = {}) {
  const storage: SessionStorage = options.storage ?? new MemoryStorage()
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

            return storage.set(key, sessionData)
          }

          return storage.delete(key)
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
        } else {
          await storage.touch(key)
        }
      }, { priority: 'high' })

      const ext: SessionExtension = {
        get: (key: string) => storage.get(key),
        set: (key: string, value: unknown) => storage.set(key, value),
        delete: (key: string) => storage.delete(key)
      }

      return ext
    }
  })
}
