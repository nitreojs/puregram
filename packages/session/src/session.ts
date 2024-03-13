import { Context } from 'puregram'

import { MemoryStorage, SessionStorage } from './storages'
import { ContextInterface, Middleware, SessionContext } from './types'

interface SessionOptions<S = unknown, C extends Context = Context> {
  initial?: (context: Context) => S;
  getStorageKey?: (context: C) => string;
  storage?: SessionStorage;
}

interface TtlData {
  t: number
  at: number
}

export const PROXY_SYM = Symbol('proxy')
export const TTL_SYM = Symbol('ttl')

const isPlainObject = (object: object): object is Record<string, any> => (
  Object.prototype.toString.call(object) === '[object Object]'
)

/** sets that this key should expire when `t` milliseconds will pass */
export const ttl = <T>(value: T, t = 30_000) => {
  if (t < 0) {
    throw new Error('could not ttl a value with t < 1')
  }

  return {
    [TTL_SYM]: true,
    value,
    t
  } as T
}

/** loads session */
export const session = <S, C extends Context>(options: SessionOptions<S, C> = {}): Middleware<C> => {
  const {
    getStorageKey = (context: ContextInterface) => (context.from ?? context.senderChat).id.toString(),
    storage = new MemoryStorage(),
    initial = () => ({})
  } = options

  const ttlMap = new Map<string, TtlData>()

  return async (context, next) => {
    const key = getStorageKey(context)

    let changed = false

    // this requires some description because there are serious hacks going on here
    // well first of all the idea of having any other external storages may seem very cool
    // until you realize you need to support calling proper methods when the session changes
    //
    // "when session changes" - you hear that? how do you make an object that informs you
    // when it changes so you can call `storage.set(key, session)` or something
    //
    // there are `Proxy` objects in javascript that allow you to listen
    // when there are any changes or calls to the value you provided
    // we use them to add extra logic behind:
    // - updating session `session.key = value`,
    // - deleting keys from session `delete session.key`,
    // - and, more importantly, getting session value `session.key`
    //
    // we create `get` trap via `Proxy` only for it to `Proxy` itself, like create a recursive `Proxy`
    // why? so we can recursively set handlers for each and every value in object and every single of them
    // will tell us when it updates
    // kinda hacky and stuff, i know, but after ~8h of thinking me and @evaqum couldnt come up with something better :P
    // still better that vue3's problem with proxies, isnt it?

    // dont ask me why and how
    const createProxy = <T extends Record<string, unknown>> (object: any): T => {
      if (typeof object !== 'object' || object === null) {
        return object
      }

      const proxify = (value: any) => {
        return new Proxy(value, {
          get (target, key) {
            if (key === PROXY_SYM) {
              return true
            }

            const value = target[key]

            if (value === undefined || value === null || typeof key === 'symbol') {
              return value
            }

            if (ttlMap.has(key)) {
              const ttlValue = ttlMap.get(key)!

              const elapsed = Date.now() - ttlValue.at

              if (elapsed > ttlValue.t) {
                delete target[key]

                return undefined
              }
            }

            if (isPlainObject(value) && !(PROXY_SYM in value)) {
              target[key] = createProxy(value)
            }

            return target[key]
          },

          set (target, key, value) {
            if (typeof key === 'symbol') {
              return false
            }

            changed = true

            if (value?.[TTL_SYM]) {
              if (value.t < 1) {
                // ttl(value, 0)
                ttlMap.delete(key)
              } else {
                // ttl(value, 5_000)
                ttlMap.set(key, { t: value.t, at: Date.now() })
              }

              target[key] = value.value
            } else {
              if (ttlMap.has(key)) {
                // updating date
                const entry = ttlMap.get(key)!

                entry.at = Date.now()

                ttlMap.set(key, entry)
              }

              target[key] = value
            }

            return true
          },

          deleteProperty (target, key) {
            changed = true

            delete target[key]

            return true
          }
        })
      }

      if (isPlainObject(object)) {
        const proxy = proxify({})

        for (const [key, value] of Object.entries(object)) {
          proxy[key] = value
        }

        return proxy
      }

      return proxify(object)
    }

    const wrap = (session: SessionContext): SessionContext => {
      if (!('$forceUpdate' in session)) {
        Object.defineProperty(session, '$forceUpdate', {
          value: $forceUpdate,
          enumerable: false
        })
      }

      if (session[PROXY_SYM as any]) {
        return session
      }

      return createProxy(session)
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
