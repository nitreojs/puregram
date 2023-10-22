import { Context } from 'puregram'

import { MemoryStorage, SessionStorage } from './storages'
import { ContextInterface, Middleware, SessionContext } from './types'

interface SessionOptions<S = unknown, C extends Context = Context> {
  initial?: (context: Context) => S

  storage?: SessionStorage

  getStorageKey?(context: C): string
}

export const session = <S, C extends Context>(options: SessionOptions<S> = {}): Middleware<C> => {
  const {
    getStorageKey = (context: ContextInterface) => context.senderId.toString(),
    storage = new MemoryStorage(),
    initial = () => ({})
  } = options

  return async (context, next) => {
    const key = getStorageKey(context)

    let changed = false

    const wrap = (session: Record<string, unknown>): SessionContext => {
      if (!('$forceUpdate' in session)) {
        Object.defineProperty(session, '$forceUpdate', {
          value: $forceUpdate,
          enumerable: false
        })
      }

      return new Proxy(session as SessionContext, {
        set (target, prop: string, value) {
          changed = true

          target[prop] = value

          return true
        },

        deleteProperty (target, prop: string) {
          changed = true

          delete target[prop]

          return true
        }
      })
    }

    const $forceUpdate = () => {
      if (Object.keys(session).length !== 0) {
        changed = false

        return storage.set(key, session)
      }

      return storage.delete(key)
    }

    const storageSession = await storage.get(key)

    const initialSession = storageSession || initial(context) || {}

    let session = wrap(initialSession)

    Object.defineProperty(context, 'session', {
      enumerable: true,
      get: () => session,
      set (newSession) {
        changed = true

        session = wrap(newSession)
      }
    })

    await next()

    if (changed || storageSession === undefined) {
      await $forceUpdate()
    } else {
      await storage.touch(key)
    }
  }
}
