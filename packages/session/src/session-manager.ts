import {
  ContextInterface,
  SessionContext,
  SessionManagerOptions,

  Middleware
} from './types'

import { MemoryStorage } from './storages'

export class SessionManager<T = {}> {
  protected storage: SessionManagerOptions['storage']

  protected getStorageKey: SessionManagerOptions['getStorageKey']

  constructor (options: Partial<SessionManagerOptions<T>> = {}) {
    this.storage = options.storage || new MemoryStorage()

    this.getStorageKey = options.getStorageKey || ((context) => String(context.senderId))
  }

  /** Returns the middleware for embedding */
  get middleware (): Middleware<ContextInterface> {
    const { storage, getStorageKey } = this

    return async (context, next) => {
      const storageKey = getStorageKey(context)

      let changed = false

      const wrapSession = (targetRaw: object): SessionContext => (
        new Proxy<SessionContext>({ ...targetRaw, $forceUpdate }, {
          set: (target, prop: string, value): boolean => {
            changed = true

            target[prop] = value

            return true
          },

          deleteProperty: (target, prop: string): boolean => {
            changed = true

            delete target[prop]

            return true
          }
        })
      )

      const $forceUpdate = () => {
        if (Object.keys(session).length > 1) {
          changed = false

          return storage.set(storageKey, session)
        }

        return storage.delete(storageKey)
      }

      const initialSession = await storage.get(storageKey) || {}

      let session = wrapSession(initialSession)

      Object.defineProperty(context, 'session', {
        get: (): SessionContext => session,
        set: (newSession) => {
          session = wrapSession(newSession)
          changed = true
        }
      })

      await next()

      if (changed) await $forceUpdate()
      else await storage.touch(storageKey)
    }
  }
}
