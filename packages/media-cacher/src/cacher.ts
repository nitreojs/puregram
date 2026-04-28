import { type KVStorage, MemoryStorage } from '@puregram/storage'
import {
  createPlugin, type MediaInput, MediaSource, MediaSourceType, type RequestContext, type Telegram
} from 'puregram'

import { type AllowedMediaMethod, MEDIA_METHOD_TO_KEY_MAP } from './method-map'

type GetStorageKey = (ctx: RequestContext) => string

const defaultGetStorageKey = (ctx: RequestContext) => {
  const chatId = ctx.params?.chat_id

  if (chatId === undefined) {
    throw new TypeError('mediaCacher: request has no chat_id; supply getStorageKey to derive a key from a different field')
  }

  return String(chatId)
}

export interface MediaCacherOptions {
  /** override the storage key derivation. default: `String(ctx.params.chat_id)` */
  getStorageKey?: GetStorageKey
  /** backing store. default: `MemoryStorage<string>` from `@puregram/storage` */
  storage?: KVStorage<string>
}

/** handle attached as `tg.mediaCacher` for manual cache inspection and eviction */
export interface MediaCacherExtension {
  /** look up the cached `file_id` for `(storageKey, sourceValue)`, or undefined if absent */
  get: (storageKey: string, sourceValue: string) => Promise<string | undefined>
  /** drop the cache entry for `(storageKey, sourceValue)` */
  invalidate: (storageKey: string, sourceValue: string) => Promise<void>
  /** the configured `KVStorage<string>` instance */
  storage: KVStorage<string>
}

interface PendingMark {
  cacheKey: string
  responseKey: string
}

// eslint-disable-next-line local-rules/no-redundant-return-type -- type predicate is needed for narrowing
function isMediaInput (value: unknown): value is MediaInput {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const v = value as { type?: unknown, value?: unknown }

  return typeof v.type === 'string' && v.value !== undefined
}

function pickFileId (mediaKey: string, result: Record<string, unknown>) {
  // animation comes back under `document` instead of `animation`
  let key = mediaKey

  if (mediaKey === 'animation' && !(mediaKey in result) && 'document' in result) {
    key = 'document'
  }

  const slot = result[key]

  // photos return an array of size variants — telegram convention is to take the largest (last)
  if (Array.isArray(slot)) {
    const last = slot[slot.length - 1] as { file_id?: unknown } | undefined

    return typeof last?.file_id === 'string' ? last.file_id : undefined
  }

  if (slot !== null && typeof slot === 'object') {
    const fileId = (slot as { file_id?: unknown }).file_id

    return typeof fileId === 'string' ? fileId : undefined
  }

  return undefined
}

/** transparent file_id caching plugin. on cache hit, swaps `Path`/`Url` media for `MediaSource.fileId` */
export function mediaCacher (options: MediaCacherOptions = {}) {
  const storage = options.storage ?? new MemoryStorage<string>()
  const getStorageKey = options.getStorageKey ?? defaultGetStorageKey
  const pending = new WeakMap<RequestContext, PendingMark>()

  return createPlugin({
    name: 'mediaCacher',
    install: (tg: Telegram) => {
      tg.useHook('onBeforeRequest', async (raw, next) => {
        const ctx = raw as RequestContext

        if (!(ctx.method in MEDIA_METHOD_TO_KEY_MAP)) {
          await next()

          return
        }

        const mediaKey = MEDIA_METHOD_TO_KEY_MAP[ctx.method as AllowedMediaMethod]
        const params = ctx.params

        if (params === undefined) {
          await next()

          return
        }

        const media = params[mediaKey]

        if (!isMediaInput(media)) {
          throw new TypeError(`mediaCacher: ${ctx.method}.${mediaKey} must be created via MediaSource.*`)
        }

        if (media.type !== MediaSourceType.Path && media.type !== MediaSourceType.Url) {
          await next()

          return
        }

        const storageKey = getStorageKey(ctx)
        const cacheKey = `${storageKey}:${media.value}`
        const cached = await storage.get(cacheKey)
        const filenameOpts = media.filename !== undefined ? { filename: media.filename } : {}

        if (cached !== undefined) {
          params[mediaKey] = MediaSource.fileId(cached, filenameOpts)
          await next()

          return
        }

        pending.set(ctx, { cacheKey, responseKey: mediaKey })
        await next()
      }, { priority: 'high' })

      tg.useHook('onResponseIntercept', async (raw, next) => {
        const ctx = raw as RequestContext
        const mark = pending.get(ctx)

        if (mark === undefined) {
          await next()

          return
        }

        pending.delete(ctx)

        const json = ctx.json as { ok?: boolean, result?: unknown } | undefined

        if (json?.ok !== true || typeof json.result !== 'object' || json.result === null) {
          await next()

          return
        }

        const fileId = pickFileId(mark.responseKey, json.result as Record<string, unknown>)

        if (fileId !== undefined) {
          await storage.set(mark.cacheKey, fileId)
        }

        await next()
      })

      const ext: MediaCacherExtension = {
        get: (storageKey, sourceValue) => storage.get(`${storageKey}:${sourceValue}`),
        invalidate: (storageKey, sourceValue) => storage.delete(`${storageKey}:${sourceValue}`),
        storage
      }

      return ext
    }
  })
}
