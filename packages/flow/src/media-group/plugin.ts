import type { MessageUpdate } from '@puregram/api'
import { createPlugin, type Middleware, type Telegram } from 'puregram'

import { MediaGroupBuffer } from './buffer'

import './update'

export interface MediaGroupOptions {
  /** time in ms to wait for additional album messages before emitting the composite (default 1000) */
  window?: number
}

export interface MediaGroupExtension {
  flush: () => void
}

interface KindLike {
  kind: string
}

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
function isMessageWithMediaGroup (update: unknown): update is MessageUpdate & { raw: { media_group_id: string } } {
  if (typeof update !== 'object' || update === null) {
    return false
  }

  if ((update as KindLike).kind !== 'message') {
    return false
  }

  const raw = (update as { raw?: { media_group_id?: unknown } }).raw

  return typeof raw?.media_group_id === 'string'
}

export function mediaGroup (options: MediaGroupOptions = {}) {
  const window = options.window ?? 1000

  return createPlugin({
    name: 'media_group',
    install: (tg: Telegram) => {
      tg.defineUpdate('media_group')

      const buffer = new MediaGroupBuffer(window, (id, messages) => {
        tg.emit('media_group', { id, messages })
      })

      const middleware: Middleware<unknown> = async (update, next) => {
        if (!isMessageWithMediaGroup(update)) {
          await next()

          return
        }

        buffer.add(update.raw.media_group_id, update)
        // consume — singletons of the album must not reach user handlers
      }

      tg.useHook('onUpdate', middleware, { priority: 'high' })
      tg.useHook('onShutdown', () => {
        buffer.flushAll()
      })

      const ext: MediaGroupExtension = {
        flush: () => {
          buffer.flushAll()
        }
      }

      return ext
    }
  })
}
