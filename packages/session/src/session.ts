import { isTtlStorage, type KVStorage, MemoryStorage } from '@puregram/storage'
import { createPlugin, type Telegram } from 'puregram'

import { wrap } from './proxy'
import { TTL_KEY, type TtlData } from './ttl'
import type { AnyUpdate, SessionContext, SessionOptions, StorageKeyDescriptor } from './types'

interface KeyResolvable {
  from?: { id?: number | string }
  senderChat?: { id?: number | string }
  chat?: { id?: number | string }
  chatId?: number | string
  messageThreadId?: number | string
}

const defaultGetStorageKey = (update: AnyUpdate) => {
  const u = update as KeyResolvable
  const chatId = u.chat?.id ?? u.chatId
  const fromId = u.from?.id

  if (chatId === undefined && fromId === undefined) {
    return undefined
  }

  const descriptor: StorageKeyDescriptor = {}

  if (typeof chatId === 'number') {
    descriptor.chat = chatId
  } else if (typeof chatId === 'string') {
    descriptor.key = chatId
  }

  if (typeof fromId === 'number') {
    descriptor.user = fromId
  }

  return descriptor
}

const normalizeKey = (raw: string | StorageKeyDescriptor) => {
  if (typeof raw === 'string') {
    return raw
  }

  const parts: string[] = []

  if (raw.user !== undefined) {
    parts.push(`user:${raw.user}`)
  }

  if (raw.chat !== undefined) {
    parts.push(`chat:${raw.chat}`)
  }

  if (raw.thread !== undefined) {
    parts.push(`thread:${raw.thread}`)
  }

  if (raw.key !== undefined) {
    parts.push(`key:${raw.key}`)
  }

  return parts.join(':')
}

const resolveKey = (
  update: AnyUpdate,
  resolver: (update: AnyUpdate) => string | StorageKeyDescriptor | undefined
) => {
  const result = resolver(update)

  if (result === undefined) {
    return undefined
  }

  if (typeof result === 'string') {
    return result.length === 0 ? undefined : result
  }

  const normalized = normalizeKey(result)

  return normalized.length === 0 ? undefined : normalized
}

// the stored record is writable from outside the plugin via `tg.session.set`, so metadata is validated key by key
const stripTtlMeta = (record: Record<string, unknown>, ttlMap: Map<string, TtlData>) => {
  if (typeof record !== 'object' || record === null || !Object.hasOwn(record, TTL_KEY)) {
    return record
  }

  const meta = record[TTL_KEY] as Record<string, Partial<TtlData> | null> | null
  const payload = { ...record }

  delete payload[TTL_KEY]

  if (typeof meta === 'object' && meta !== null) {
    for (const [k, entry] of Object.entries(meta)) {
      if (typeof entry?.t === 'number' && typeof entry.at === 'number' && Object.hasOwn(payload, k)) {
        ttlMap.set(k, { t: entry.t, at: entry.at })
      }
    }
  }

  return payload
}

const attachTtlMeta = (payload: Record<string, unknown>, ttlMap: Map<string, TtlData>) => {
  for (const k of ttlMap.keys()) {
    if (!Object.hasOwn(payload, k)) {
      ttlMap.delete(k)
    }
  }

  if (ttlMap.size === 0) {
    return payload
  }

  return { ...payload, [TTL_KEY]: Object.fromEntries(ttlMap) }
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
  // lazy mode skips storage.get until update.session is touched; off by default so
  // downstream plugins (scenes) keep their sync `u.session.x = y` access pattern
  const lazy = options.lazy ?? false

  return createPlugin({
    name: 'session',
    install: (tg: Telegram) => {
      tg.useHook('onUpdate', async (update, next) => {
        const key = resolveKey(update as AnyUpdate, getStorageKey)

        if (key === undefined) {
          await next()

          return
        }

        const ttlMap = new Map<string, TtlData>()
        let changed = false
        let touched = false
        let loaded = false
        let stored: unknown
        let sessionData: Record<string, unknown> | undefined
        let proxy: SessionContext | undefined

        const onChange = () => {
          changed = true
        }

        const $forceUpdate = async () => {
          if (sessionData === undefined) {
            return
          }

          if (Object.keys(sessionData).length !== 0) {
            changed = false
            await storage.set(key, attachTtlMeta(sessionData, ttlMap))

            return
          }

          await storage.delete(key)
        }

        const load = async () => {
          if (loaded) {
            return proxy as SessionContext
          }

          loaded = true
          stored = await storage.get(key)
          sessionData = stored !== undefined
            ? stripTtlMeta(stored as Record<string, unknown>, ttlMap)
            : initial(update as AnyUpdate) as Record<string, unknown>

          proxy = wrap(sessionData, $forceUpdate, ttlMap, onChange) as SessionContext

          return proxy
        }

        if (!lazy) {
          await load()
        }

        Object.defineProperty(update, 'session', {
          get: () => {
            touched = true

            if (proxy !== undefined) {
              return proxy
            }

            // lazy first-access — return a thenable that resolves to the proxy
            const pending = load()

            return {
              then: pending.then.bind(pending),
              catch: pending.catch.bind(pending),
              finally: pending.finally.bind(pending)
            }
          },
          enumerable: true,
          configurable: false
        })

        await next()

        if (!touched && lazy) {
          return
        }

        // ensure lazy load resolved before deciding whether to flush/touch
        await load()

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
