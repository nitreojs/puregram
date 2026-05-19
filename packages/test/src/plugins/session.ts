import type { Telegram } from 'puregram'

import type { TestUser } from '../actors/user'
import type { TestEnv } from '../env'

import { registerPack } from './registry'

interface SessionExtensionRuntime {
  get: (key: string) => Promise<unknown>
  set: (key: string, value: unknown) => Promise<void>
  delete: (key: string) => Promise<void>
  has: (key: string) => Promise<boolean>
}

type SessionData = Record<string, unknown>

interface SessionHandle {
  (user: TestUser): SessionData
  seed: (user: TestUser, data: SessionData) => Promise<void>
  raw: (key: string) => Promise<SessionData | undefined>
}

declare module '../env' {
  interface TestEnv {
    session?: SessionHandle
  }
}

interface KeyResolvable {
  from?: { id?: number | string }
  senderChat?: { id?: number | string }
  chat?: { id?: number | string }
}

// mirrors `@puregram/session`'s default composite keyer: `user:<from.id>:chat:<chat.id>`
// with undefined segments omitted. testuser→pm convention means user.id === pmChat.id
const keyOf = (user: TestUser) => `user:${user.id}:chat:${user.id}`

const isObject = (value: unknown): value is SessionData => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
)

const updateKey = (update: unknown) => {
  const u = update as KeyResolvable
  const fromId = u.from?.id
  const chatId = u.chat?.id ?? u.senderChat?.id

  const segments: string[] = []

  if (fromId !== undefined) {
    segments.push(`user:${fromId}`)
  }

  if (chatId !== undefined) {
    segments.push(`chat:${chatId}`)
  }

  return segments.length > 0 ? segments.join(':') : undefined
}

registerPack({
  pluginName: 'session',
  apply (env: TestEnv, tg: Telegram) {
    const ext = (tg as unknown as { session?: SessionExtensionRuntime }).session

    if (ext === undefined) {
      return
    }

    // local snapshot mirrored to storage on dispatch settle / seed / proxy writes —
    // gives tests sync reads even though kv is async-only
    const cache = new Map<string, SessionData>()

    const refresh = async (key: string) => {
      const stored = await ext.get(key)

      if (isObject(stored)) {
        cache.set(key, { ...stored })
      } else {
        cache.delete(key)
      }
    }

    env.onPostInject(async (raw) => {
      // session writes happen as dispatch unwinds — storage is settled by the time
      // post-inject fires; refresh whichever key the inbound update would have hit
      const payload = (() => {
        for (const k of Object.keys(raw)) {
          const v = raw[k]

          if (k !== 'update_id' && isObject(v)) {
            return v
          }
        }

        return undefined
      })()

      if (payload === undefined) {
        return
      }

      const key = updateKey(payload)

      if (key !== undefined) {
        await refresh(key)
      }
    })

    const handle: SessionHandle = ((user: TestUser) => {
      const key = keyOf(user)

      if (!cache.has(key)) {
        cache.set(key, {})
      }

      const target = cache.get(key) as SessionData

      return new Proxy(target, {
        get (t, prop) {
          if (typeof prop === 'symbol') {
            return t[prop as unknown as string]
          }

          return t[prop]
        },

        set (t, prop, value) {
          if (typeof prop === 'symbol') {
            return false
          }

          t[prop] = value
          // eslint-disable-next-line @typescript-eslint/no-floating-promises -- fire-and-forget kv mirror
          ext.set(key, { ...t })

          return true
        },

        deleteProperty (t, prop) {
          if (typeof prop === 'symbol') {
            return false
          }

          delete t[prop]
          // eslint-disable-next-line @typescript-eslint/no-floating-promises -- fire-and-forget kv mirror
          ext.set(key, { ...t })

          return true
        }
      })
    }) as SessionHandle

    handle.seed = async (user, data) => {
      const key = keyOf(user)
      const next = { ...data }

      cache.set(key, { ...next })
      await ext.set(key, next)
    }

    handle.raw = async (key) => {
      const stored = await ext.get(key)

      return isObject(stored) ? stored : undefined
    }

    env.session = handle

    const storageView = env.ensureStorage()

    storageView.register('session', ext)
  }
})

export {}
