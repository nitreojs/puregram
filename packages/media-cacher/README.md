<div align='center'>
  <img src='https://i.imgur.com/ZzjmE8i.png' />
</div>

<br />

<div align='center'>
  <a href='https://github.com/nitreojs/puregram'><b><code>puregram</code></b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#options'><b>options</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://t.me/pureforum'><b>telegram forum</b></a>
</div>

## @puregram/media-cacher

_cache sent media `file_id`s with ease for `puregram` package_

### introduction

if you send a lot of similar `MediaSource.path` or `MediaSource.url` files you've probably noticed how slow that gets. heavy files take real seconds to upload, every single time, and it's not like you actually *want* to wait those extra times. that's why you probably need `@puregram/media-cacher`

it sits as an `onBeforeRequest` hook on every cacheable upload method (`sendPhoto`, `sendVideo`, `sendAnimation`, `sendVideoNote`, `sendAudio`, `sendDocument`, `sendSticker`). first call uploads as normal and stores the resulting `file_id` keyed by `(chatId, sourceValue)`. every later call swaps the path/url for the cached `MediaSource.fileId(...)` before the request leaves your bot — telegram never sees the file twice

### example

```ts
import { Telegram, MediaSource } from 'puregram'
import { mediaCacher } from '@puregram/media-cacher'

const telegram = Telegram.fromToken(process.env.TOKEN!)
  .extend(mediaCacher()) // <-- !

telegram.onMessage((message) => {
  return telegram.api.sendPhoto({
    chat_id: message.chat.id,
    photo: MediaSource.path('./cat.png')
  })
})

await telegram.startPolling()
```

if `./cat.png` is heavy, the first send takes the upload time. every next send to the same chat is instantaneous — `MediaSource.path('./cat.png')` quietly becomes the cached `file_id` before the request fires

### installation

```sh
$ yarn add @puregram/media-cacher
$ npm i -S @puregram/media-cacher
```

`@puregram/media-cacher` re-exports `MemoryStorage` and `KVStorage` from [`@puregram/storage`](../storage) — install `@puregram/storage` separately only if you want to share one storage instance across multiple plugins or import the additional `LruMemoryStorage` / `TtlStorage` types

---

## what gets cached

| method | media field | cached? |
|---|---|---|
| `sendPhoto` | `photo` | ✅ |
| `sendVideo` | `video` | ✅ |
| `sendAnimation` | `animation` | ✅ |
| `sendVideoNote` | `video_note` | ✅ |
| `sendAudio` | `audio` | ✅ |
| `sendDocument` | `document` | ✅ |
| `sendSticker` | `sticker` | ✅ |
| every other api method | — | ❌ untouched |

cache only fires for `MediaSource.path(...)` and `MediaSource.url(...)` inputs. buffers, streams, base64 — those are typically one-off and don't repeat enough to be worth tracking

the live list lives at `MEDIA_METHOD_TO_KEY_MAP` and `ALLOWED_MEDIA_TYPES` if you need to introspect

---

## custom storage

internally `@puregram/media-cacher` uses [`MemoryStorage`](../storage) — fine for development but lost on restart. swap in any `KVStorage<string>` for persistence. classic case is reaching for redis:

```ts
import { mediaCacher } from '@puregram/media-cacher'
import { RedisStorage } from 'some-redis-storage-implementation-i-guess'

telegram.extend(mediaCacher({
  storage: new RedisStorage({ /* ... */ })
}))
```

bounded in-memory works too — useful when you don't care about cross-restart persistence but want a hard ceiling on memory:

```ts
import { LruMemoryStorage } from '@puregram/storage'

telegram.extend(mediaCacher({
  storage: new LruMemoryStorage<string>({ max: 5_000 })
}))
```

see [`@puregram/storage`](../storage) for the full `KVStorage<V>` contract and a redis-flavored example

---

## `getStorageKey`

every storage-using satellite in puregram exposes a `getStorageKey` hook so you can decide what counts as the same "user" / "scope" for cache purposes. the default keys cache entries by `chat_id` — so the same `./cat.png` cached for chat A doesn't leak into chat B (different chats might have different access permissions, especially for stickers / documents in private vs. group contexts)

```ts
mediaCacher({
  // share a single global cache across every chat — risky for permission-sensitive media,
  // but fine for fully public assets
  getStorageKey: () => 'global'
})
```

throws `TypeError` at request time if the default derivation can't find a `chat_id` and you haven't supplied a custom `getStorageKey` — methods that don't carry a `chat_id` (none in the cached-method list above) won't hit this, but if you ever extend the list, supply `getStorageKey` defensively

---

## manual inspection — `telegram.mediaCacher`

the plugin attaches a small handle for direct cache reads / evictions:

```ts
// look up the cached file_id for (storageKey, sourceValue)
const fileId = await telegram.mediaCacher.get('100', './cat.png')

if (fileId !== undefined) {
  console.log('already cached:', fileId)
}

// drop a single entry — next send will re-upload
await telegram.mediaCacher.invalidate('100', './cat.png')

// the raw KVStorage<string>, in case you need it
await telegram.mediaCacher.storage.set('whatever:key', 'AgADAQA…')
```

`storageKey` is what `getStorageKey(ctx)` returned (default: `String(ctx.params.chat_id)`). `sourceValue` is the raw string the `MediaSource` carried — `'./cat.png'` for path, `'https://…'` for url

---

<a name='options'></a>
## options

`mediaCacher(options?)`:

| option | type | description |
|---|---|---|
| `storage` | `KVStorage<string>` | backing store. default: a fresh `MemoryStorage<string>`. swap for redis/sqlite/`LruMemoryStorage`/etc to persist or bound the cache |
| `getStorageKey` | `(ctx: RequestContext) => string` | how to derive the cache scope key from each outgoing request. default: `String(ctx.params.chat_id)`. throws if `chat_id` is absent and you haven't overridden |

---

## `telegram.mediaCacher` interface reference

```ts
interface MediaCacherExtension {
  /** look up the cached file_id for (storageKey, sourceValue), or undefined */
  get: (storageKey: string, sourceValue: string) => Promise<string | undefined>

  /** drop the entry for (storageKey, sourceValue) */
  invalidate: (storageKey: string, sourceValue: string) => Promise<void>

  /** the configured KVStorage<string> instance — direct access if you need it */
  storage: KVStorage<string>
}
```

---

## exported types

```ts
import type {
  AllowedMediaMethod,         // 'sendPhoto' | 'sendVideo' | … (the seven cached methods)
  KVStorage,                   // re-exported from @puregram/storage
  MediaCacherExtension,        // shape of telegram.mediaCacher
  MediaCacherOptions           // options to mediaCacher({...})
} from '@puregram/media-cacher'

import {
  ALLOWED_MEDIA_TYPES,         // [MediaSourceType.Path, MediaSourceType.Url]
  MEDIA_METHOD_TO_KEY_MAP,     // { sendPhoto: 'photo', sendVideo: 'video', … }
  MemoryStorage                // re-exported from @puregram/storage
} from '@puregram/media-cacher'
```
