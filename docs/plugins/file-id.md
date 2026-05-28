---
title: '@puregram/file-id'
description: parse, inspect and serialize telegram file_id and file_unique_id strings — decode the TDLib blob to dc id, file type, access hash, and more
---

# `@puregram/file-id`

every file in telegram carries a `file_id` — that opaque base64url-looking string you pass to `sendPhoto`, `sendDocument`, etc. it's not actually opaque: it's a TL-serialized [TDLib](https://core.telegram.org/tdlib) blob with the data center, file type, access hash, photo size source, and a few other useful bits packed inside. `@puregram/file-id` decodes it

zero `puregram` bindings, zero runtime deps. drop it into any node 22+ project — it's just a parser

## when to use

- you want to know which DC a file lives on (useful for routing / debugging)
- you need to derive the stable `file_unique_id` from a `file_id` without making an api call
- you're building tooling that inspects or rewrites telegram file handles
- you need to branch logic on file type (`FileType.Sticker`, `FileType.Animation`, etc.)

## install

::: code-group

```sh [yarn]
yarn add @puregram/file-id
```

```sh [npm]
npm i -S @puregram/file-id
```

```sh [pnpm]
pnpm add @puregram/file-id
```

:::

## quick start

```ts
import { Telegram } from 'puregram'
import { FileId } from '@puregram/file-id'

const DC_NAMES: Record<number, string> = {
  1: 'Miami, FL, USA',
  2: 'Amsterdam, NL',
  3: 'Miami, FL, USA',
  4: 'Amsterdam, NL',
  5: 'Singapore'
}

const tg = Telegram.fromToken(process.env.TOKEN!)

tg.onMessage(async (message) => {
  if (!message.hasPhoto()) {
    return
  }

  const file = FileId.from(message.photo.biggest.fileId)
  const where = DC_NAMES[file.dcId] ?? '?'

  await message.send(`stored on DC ${file.dcId} (${where})`)
})

await tg.startPolling()
```

## core api

### `FileId.from(string)`

parses a `file_id` string and returns a `FileId` instance. throws [`FileIdParseError`](#errors) on malformed input or [`UnsupportedFileIdVersionError`](#errors) when the format version is newer than what this package understands

```ts
import { FileId, FileType } from '@puregram/file-id'

const file = FileId.from('AgACAgIAAxkDAAIBcGT...etc')

file.kind           // 'photo' | 'document' | 'web'
file.fileType       // FileType.Photo / .Sticker / .Animation / …
file.dcId           // 1..5
file.version        // file_id format major version
file.subVersion     // file_id format minor version
file.accessHash     // bigint
file.fileReference  // Uint8Array | undefined
file.hasReference   // true when the file_id carries a fresh reference
file.hasWebLocation // true for kind: 'web' ids
```

the `.raw` property holds the full discriminated union shape (`ParsedFileId`)

#### kind-specific getters

| getter | populated when | type |
|---|---|---|
| `file.id` | `kind === 'photo' \| 'document'` | `bigint` |
| `file.photoSize` | `kind === 'photo'` | `PhotoSizeSource` |
| `file.url` | `kind === 'web'` | `string` |

for type-narrowed access use the [type guards](#type-guards):

```ts
import { FileId, isPhotoFileId, isWebFileId } from '@puregram/file-id'

const file = FileId.from('...')

if (isPhotoFileId(file.raw)) {
  console.log(file.raw.id, file.raw.photoSize.type)
}

if (isWebFileId(file.raw)) {
  console.log(file.raw.url)
}
```

### `file.toString()` — re-serialize

```ts
const original = 'AgACAgI...'
const parsed = FileId.from(original)

console.log(parsed.toString() === original) // round-trip preserves bytes
```

### `file.toUniqueId()` — derive the matching `file_unique_id`

telegram exposes both `file_id` (may rotate, chat-scoped) and `file_unique_id` (stable identity). the second is derivable from the first — no api call needed:

```ts
const file = FileId.from('AgACAgI...')
const unique = file.toUniqueId()

unique.toString() // base64url
unique.kind       // 'photo' | 'document' | 'web' | …
```

### `FileUniqueId.from(string)`

parses a `file_unique_id` string:

```ts
import { FileUniqueId } from '@puregram/file-id'

const unique = FileUniqueId.from('AgADAQADAg')

unique.kind     // 'photo' | 'document' | 'web' | 'secure' | 'encrypted' | 'temp'
unique.id       // bigint | undefined
unique.url      // string — only for kind: 'web'
unique.volumeId // bigint — only for kind: 'photo'
unique.localId  // number — only for kind: 'photo'

unique.toString() // re-serializes back to the same string
```

`file_unique_id` strings are short — they don't carry DC info, access hash, or photo-size source. all of that lives in the full `file_id`

### type guards

discriminated narrows on `parsed.raw`:

| guard | narrows to |
|---|---|
| `isPhotoFileId(raw)` | `PhotoFileId` |
| `isDocumentFileId(raw)` | `DocumentFileId` |
| `isWebFileId(raw)` | `WebFileId` |
| `isStickerFileId(raw)` | `DocumentFileId` with `fileType === FileType.Sticker` |

for `FileUniqueId.raw`:

| guard | narrows to |
|---|---|
| `isPhotoUniqueId(raw)` | `PhotoFileUniqueId` |
| `isDocumentUniqueId(raw)` | `DocumentFileUniqueId` |
| `isWebUniqueId(raw)` | `WebFileUniqueId` |
| `isSecureUniqueId(raw)` | `SecureFileUniqueId` |
| `isEncryptedUniqueId(raw)` | `EncryptedFileUniqueId` |
| `isTempUniqueId(raw)` | `TempFileUniqueId` |

### functional api

every entry point on the classes is also available as a free function:

| class method | free function |
|---|---|
| `FileId.from(s)` | `parseFileId(s)` |
| `file.toString()` | `serializeFileId(raw)` |
| `file.toUniqueId()` | `fileUniqueIdFromFileId(raw)` |
| `FileUniqueId.from(s)` | `parseFileUniqueId(s)` |
| `unique.toString()` | `serializeFileUniqueId(raw)` |

```ts
import { parseFileId, serializeFileId, fileUniqueIdFromFileId } from '@puregram/file-id'

const raw = parseFileId('AgACAgI...')
const back = serializeFileId(raw)
const uniqueRaw = fileUniqueIdFromFileId(raw)
```

### `PhotoSizeSource` discriminated union

photos carry a `photo_size_source` describing where the thumbnail came from. switch on `ps.type`:

```ts
import { isPhotoFileId } from '@puregram/file-id'

const file = FileId.from('AgACAgI...')

if (isPhotoFileId(file.raw)) {
  const ps = file.raw.photoSize

  switch (ps.type) {
    case 'legacy':                ps.localId; break
    case 'thumbnail':             ps.thumbnailType; break
    case 'dialog_photo_small':    ps.dialogId; break
    case 'dialog_photo_big':      ps.dialogId; break
    case 'sticker_set_thumbnail': ps.stickerSetId; break
  }
}
```

per-variant type guards: `isLegacySource`, `isThumbnailSource`, `isDialogPhotoSmallSource`, `isDialogPhotoBigSource`, `isStickerSetThumbnailSource`

## errors

| class | thrown when |
|---|---|
| `FileIdParseError` | malformed base64url, truncated TL, unknown file type |
| `UnsupportedFileIdVersionError` | the `file_id`'s major/minor version is newer than what this package supports |

```ts
import { FileId, FileIdParseError, UnsupportedFileIdVersionError } from '@puregram/file-id'

try {
  FileId.from(suspect)
} catch (error) {
  if (error instanceof UnsupportedFileIdVersionError) {
    console.error('newer telegram format:', error.message)
  } else if (error instanceof FileIdParseError) {
    console.error('malformed file_id:', error.message)
  } else {
    throw error
  }
}
```

`UnsupportedFileIdVersionError` exposes `.version` and `.subVersion` — open an issue when you hit this; telegram has bumped the format

## types

```ts
import type {
  ParsedFileId,
  PhotoFileId,
  DocumentFileId,
  WebFileId,
  ParsedFileUniqueId,
  PhotoFileUniqueId,
  DocumentFileUniqueId,
  WebFileUniqueId,
  SecureFileUniqueId,
  EncryptedFileUniqueId,
  TempFileUniqueId,
  PhotoSizeSource
} from '@puregram/file-id'

import { FileType, FileUniqueType, PhotoSizeSourceType } from '@puregram/file-id'
```

`FileType` mirrors [TDLib's FileType enum](https://core.telegram.org/tdlib/getting-started#downloading-files) — 26 variants from `Thumbnail` through `SelfDestructingVoiceNote`

## low-level encoding helpers

the encoding primitives used internally are also exported — useful for custom serializers or testing:

| export | purpose |
|---|---|
| `base64urlEncode` / `base64urlDecode` | TDLib's url-safe base64 (no padding) |
| `rleEncode` / `rleDecode` | run-length encoding for zero bytes |
| `packTlString` / `unpackTlString` | TL string framing (length prefix, alignment) |
| `BinaryReader` / `BinaryWriter` | little-endian bigint-aware reader/writer |

## see also

- [inline-message-id plugin](/plugins/inline-message-id) — same TL-decode approach for `inline_message_id`
- [/api/methods](/api/methods) — bot api methods that accept `file_id`
- [/api/objects](/api/objects) — bot api types that carry `file_id` and `file_unique_id`
