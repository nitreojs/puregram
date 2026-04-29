import { createPlugin, type Telegram } from 'puregram'

import { SceneContext, type ScenePayload } from './contexts/scene'
import { SceneManager } from './manager'
import type { SceneInterface } from './scenes/scene'
import type { AnyUpdate, SceneOptions } from './types'

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

/**
 * runtime scene registry exposed as `tg.scenes`. mirrors the manager surface but
 * keeps SceneManager itself package-private
 */
export interface ScenesExtension {
  add: (scene: SceneInterface) => void
  has: (slug: string) => boolean
  remove: (slug: string) => boolean
  all: () => SceneInterface[]
}

export function scenes (options: SceneOptions = {}) {
  const manager = new SceneManager(options.scenes !== undefined ? { scenes: options.scenes } : {})
  const getStorageKey = options.getStorageKey ?? defaultGetStorageKey

  return createPlugin({
    name: 'scenes',
    dependsOn: ['session'],
    install: (tg: Telegram) => {
      tg.useHook('onUpdate', async (update, next) => {
        const key = getStorageKey(update as AnyUpdate)

        if (key === undefined) {
          await next()

          return
        }

        // session middleware (priority high, registered first via dependsOn) has
        // already attached update.session, so reading it here is safe
        const payload = update as ScenePayload
        const ctx = new SceneContext({ payload, manager })

        Object.defineProperty(update, 'scene', {
          value: ctx,
          enumerable: true,
          configurable: false
        })

        if (ctx.current !== undefined) {
          // active scene owns this update — consume it
          await ctx.reenter()

          return
        }

        await next()
      }, { priority: 'high' })

      const ext: ScenesExtension = {
        add: (scene) => { manager.add(scene) },
        has: (slug) => manager.has(slug),
        remove: (slug) => manager.remove(slug),
        all: () => manager.all()
      }

      return ext
    }
  })
}
