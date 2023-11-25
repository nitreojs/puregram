import { Context } from 'puregram'

import { MemoryStorage, SessionStorage } from './storages'
import { ContextInterface, Middleware, SessionContext } from './types'

interface SessionOptions<S = unknown, C extends Context = Context> {
  initial?: (context: Context) => S;
  getStorageKey?: (context: C) => string;
  storage?: SessionStorage;
}

export const PROXY_SYM = Symbol('proxy')

export const session = <S, C extends Context>(options: SessionOptions<S, C> = {}): Middleware<C> => {
  const {
    getStorageKey = (context: ContextInterface) => context.senderId.toString(),
    storage = new MemoryStorage(),
    initial = () => ({})
  } = options

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

    const wrap = (session: Record<string, unknown>): SessionContext => {
      if (!('$forceUpdate' in session)) {
        Object.defineProperty(session, '$forceUpdate', {
          value: $forceUpdate,
          enumerable: false
        })
      }

      // dont ask me why and how
      const createProxy = <T> (object: any): T => {
        if (typeof object !== 'object' || object === null) {
          return object
        }

        return new Proxy(object, {
          get (target, key: keyof typeof target) {
            if (key === PROXY_SYM) {
              return true
            }

            const property = target[key]

            if (property === undefined || property === null || typeof key === 'symbol') {
              return property
            }

            if (typeof property === 'object' && !property[PROXY_SYM]) {
              target[key] = createProxy(property)
            }

            return target[key]
          },

          set (target, key, value) {
            changed = true

            target[key] = value

            return true
          },

          deleteProperty (target, key) {
            changed = true

            delete target[key]

            return true
          }
        })
      }

      if (session[PROXY_SYM as any]) {
        return session as SessionContext
      }

      return createProxy(session as SessionContext)
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
