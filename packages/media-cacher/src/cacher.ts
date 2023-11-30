import { type BeforeRequestContext, type Hooks, MediaSourceType, MediaSource, MediaInput } from 'puregram'

import { MemoryStorage, type SessionStorage } from './storages'
import { isMediaInput } from './utils'

type AllowedMediaMethod = 'sendPhoto' | 'sendVideo' | 'sendAnimation' | 'sendVideoNote' | 'sendAudio' | 'sendDocument' | 'sendSticker'

const MEDIA_METHOD_TO_KEY_MAP: Record<AllowedMediaMethod, string> = {
  sendPhoto: 'photo',
  sendVideo: 'video',
  sendAnimation: 'animation',
  sendVideoNote: 'video_note',
  sendAudio: 'audio',
  sendDocument: 'document',
  sendSticker: 'sticker'
}

const ALLOWED_MEDIA_TYPES: MediaSourceType[] = [
  MediaSourceType.Path,
  MediaSourceType.Url
]

const REQUIRES_PROCESSING_SYM = Symbol('requires_processing') as any

interface CacheOptions {
  getStorageKey?: (context: BeforeRequestContext) => string;
  storage?: SessionStorage
}

export const hooks = (options: CacheOptions = {}): Partial<Hooks> => {
  const {
    getStorageKey = (context: BeforeRequestContext) => context.params.chat_id.toString(),
    storage = new MemoryStorage()
  } = options

  return {
    onBeforeRequest: [
      async (context) => {
        if (!('chat_id' in context.params)) {
          return context
        }

        const storageKey = getStorageKey(context)

        if (context.path in MEDIA_METHOD_TO_KEY_MAP) {
          const mediaKey = MEDIA_METHOD_TO_KEY_MAP[context.path as AllowedMediaMethod]
          const media = context.params[mediaKey]

          if (!isMediaInput(media)) {
            throw new TypeError('expected media to be created via `MediaSource`')
          }

          // skipping
          if (!ALLOWED_MEDIA_TYPES.includes(media.type)) {
            return context
          }

          const storageHasValueByKey = await storage.has(storageKey)

          if (!storageHasValueByKey) {
            // `Type 'unique symbol' cannot be used as an index type.`
            // what a shame
            context.params[REQUIRES_PROCESSING_SYM] = true

            return context
          }

          const key = `${storageKey}:${media.value}`

          const fileId = await storage.get(key) as string

          context.params[mediaKey] = MediaSource.fileId(fileId, { filename: media.filename })
        }

        return context
      }
    ],

    onResponseIntercept: [
      async (context) => {
        if (!context.params[REQUIRES_PROCESSING_SYM]) {
          return context
        }

        if (!context.json.ok) {
          return context
        }

        const storageKey = getStorageKey(context)

        let mediaKey = MEDIA_METHOD_TO_KEY_MAP[context.path as AllowedMediaMethod]

        const media = context.params[mediaKey] as MediaInput

        // for some reason telegram uses `document` instead of `animation`
        if (mediaKey === 'animation' && !(mediaKey in context.json.result)) {
          mediaKey = 'document'
        }

        const response = (context.json.result as Record<string, any>)[mediaKey]

        const key = `${storageKey}:${media.value}`

        await storage.set(key, response.file_id as string)

        return context
      }
    ]
  }
}
