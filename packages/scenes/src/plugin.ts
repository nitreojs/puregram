import { createPlugin, type Telegram } from 'puregram'

import { SceneContext, type ScenePayload } from './contexts/scene'
import { SceneManager } from './manager'
import type { SceneInterface } from './scenes/scene'
import type { SceneOptions } from './types'

interface MaybeSessionUpdate {
  session?: ScenePayload['session']
}

/** runtime scene registry exposed as `tg.scenes`. mirrors the manager surface; SceneManager stays package-private */
export interface ScenesExtension {
  add: (scene: SceneInterface) => void
  has: (slug: string) => boolean
  remove: (slug: string) => boolean
  all: () => SceneInterface[]
}

export function scenes (options: SceneOptions = {}) {
  const manager = new SceneManager(options.scenes !== undefined ? { scenes: options.scenes } : {})
  const passthrough = options.passthrough ?? (() => false)

  return createPlugin({
    name: 'scenes',
    dependsOn: ['session'],
    install: (tg: Telegram) => {
      tg.useHook('onUpdate', async (update, next) => {
        // session middleware ran first via `dependsOn`. scene state lives inside its record,
        // so an update session skipped (unkeyable) has nowhere to keep `__scene`
        if ((update as MaybeSessionUpdate).session === undefined) {
          await next()

          return
        }

        const payload = update as unknown as ScenePayload
        const ctx = new SceneContext({ payload, manager })

        Object.defineProperty(update, 'scene', {
          value: ctx,
          enumerable: true,
          configurable: false
        })

        // active scene owns the update unless `passthrough` exempts it (e.g. global /whoami commands)
        if (ctx.current !== undefined && !passthrough(update)) {
          await ctx.reenter()

          return
        }

        await next()
      }, { priority: 'high' })

      const ext: ScenesExtension = {
        add: (scene) => {
          manager.add(scene)
        },
        has: slug => manager.has(slug),
        remove: slug => manager.remove(slug),
        all: () => manager.all()
      }

      return ext
    }
  })
}
