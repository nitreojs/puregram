<div align='center'>
  <img src='https://i.imgur.com/ZzjmE8i.png' />
</div>

<br />

<div align='center'>
  <a href='https://github.com/puregram/puregram'><b><code>puregram</code></b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='#api'><b>api</b></a>
  <span>&nbsp;•&nbsp;</span>
  <a href='https://t.me/pureforum'><b>telegram forum</b></a>
</div>

## @puregram/file-id

_parse, inspect and serialize telegram `file_id` and `file_unique_id` strings_

### introduction

every file in telegram has a `file_id` — that opaque base64url-looking string you pass to `sendPhoto`, `sendDocument` etc. it's not actually opaque: it's a TL-serialized [TDLib](https://core.telegram.org/tdlib) blob with the file's data center, type, access hash, photo size source, and a few other useful bits packed inside. **`@puregram/file-id` decodes it.**

zero `puregram` bindings, zero deps. drop it in any node 22+ project — it's just a parser

### example

a tiny bot that tells the user which telegram data center their photos are stored on:

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

const telegram = Telegram.fromToken(process.env.TOKEN!)

telegram.onMessage(async (message) => {
  if (!message.hasPhoto()) {
    return
  }

  const file = FileId.from(message.photo.biggest.fileId)
  const where = DC_NAMES[file.dcId] ?? '?'

  await message.send(`stored on DC ${file.dcId} (${where})`)
})

await telegram.startPolling()
```

forwards work too — the embedded photo's `file_id` keeps the original DC of the upload, regardless of who forwarded it. very fun!

### installation

```sh
$ yarn add @puregram/file-id
$ npm i -S @puregram/file-id
```

requires node `>=22.0.0`

---

<a name='api'></a>
## api

<a name='file-id'></a>
### `FileId.from(string)` — parse a `file_id`

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
file.hasWebLocation // true for `kind: 'web'` ids

if (file.fileType === FileType.Sticker) {
  // …
}
```

every `FileId` keeps the parsed payload on `.raw` (a discriminated union — see below). throws [`FileIdParseError`](#errors) on malformed input or [`UnsupportedFileIdVersionError`](#errors) when telegram bumps the format past what the current `@puregram/file-id` understands

#### kind-specific accessors

depending on `file.kind`, some fields are populated and others aren't:

| getter | populated when | type |
|---|---|---|
| `file.id` | `kind === 'photo' \| 'document'` | `bigint` |
| `file.photoSize` | `kind === 'photo'` | `PhotoSizeSource` (see below) |
| `file.url` | `kind === 'web'` | `string` |

for type-narrowed access to `.raw` use the [type guards](#type-guards):

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

#### `file.toString()` — re-serialize

```ts
const original = 'AgACAgI...'
const parsed = FileId.from(original)

console.log(parsed.toString() === original)  // round-trip preserves bytes
```

#### `file.toUniqueId()` — derive the matching `file_unique_id`

telegram exposes both `file_id` (chat-scoped, may rotate) and `file_unique_id` (stable identity across the file's lifetime). the second one is derivable from the first:

```ts
const file = FileId.from('AgACAgI...')
const unique = file.toUniqueId()

unique.toString()  // base64url
unique.kind        // 'photo' | 'document' | 'web' | …
```

useful when you want to dedupe — same `file_unique_id` ⇒ same underlying file

<a name='file-unique-id'></a>
### `FileUniqueId.from(string)` — parse a `file_unique_id`

```ts
import { FileUniqueId } from '@puregram/file-id'

const unique = FileUniqueId.from('AgADAQADAg')

unique.kind     // 'photo' | 'document' | 'web' | 'secure' | 'encrypted' | 'temp'
unique.id       // bigint | undefined
unique.url      // string — only for kind: 'web'
unique.volumeId // bigint — only for kind: 'photo'
unique.localId  // number — only for kind: 'photo'

unique.toString()  // re-serializes back to the same string
```

`file_unique_id` strings are short — six bytes of TL plus base64url. they don't carry DC info, access hash, or photo-size source — that's all on the full `file_id`

<a name='type-guards'></a>
### type guards

discriminated narrows on `parsed.raw`. all return `boolean` (and `is X` at the type level):

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

<a name='file-type'></a>
### `FileType` enum

mirrors [TDLib's `FileType`](https://core.telegram.org/tdlib/getting-started#downloading-files). useful for branching on `parsed.fileType`:

```ts
import { FileType } from '@puregram/file-id'

FileType.Photo                  // 2
FileType.Sticker                // 8
FileType.Video                  // 4
FileType.Animation              // 10
FileType.VoiceNote              // 3
FileType.VideoNote              // 13
FileType.Document               // 5
FileType.SelfDestructingPhoto   // 22
// …and ~30 more
```

the full list lives in [`packages/file-id/src/constants.ts`](src/constants.ts)

<a name='photo-size-source'></a>
### `PhotoSizeSource` discriminated union

photos carry a `photo_size_source` describing where the size came from — a thumbnail, a dialog photo, a sticker set thumbnail, or the legacy pre-`RemovePhotoVolumeAndLocalId` shape

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

each variant has its own type guard exported from the same module — `isLegacySource`, `isThumbnailSource`, `isDialogPhotoSmallSource`, `isDialogPhotoBigSource`, `isStickerSetThumbnailSource`. the `PhotoSizeSource` union itself is also exported for type-only use

<a name='functional-api'></a>
### functional api (no class)

every entry point on the class also exists as a free function — useful when you don't want the class wrapper:

| class | function |
|---|---|
| `FileId.from(s)` | `parseFileId(s)` |
| `parsed.toString()` | `serializeFileId(raw)` |
| `parsed.toUniqueId()` | `fileUniqueIdFromFileId(raw)` |
| `FileUniqueId.from(s)` | `parseFileUniqueId(s)` |
| `unique.toString()` | `serializeFileUniqueId(raw)` |

```ts
import { parseFileId, serializeFileId, fileUniqueIdFromFileId } from '@puregram/file-id'

const raw = parseFileId('AgACAgI...')
const back = serializeFileId(raw)
const uniqueRaw = fileUniqueIdFromFileId(raw)
```

<a name='errors'></a>
### errors

both errors extend `Error`, so `instanceof` works:

- **`FileIdParseError`** — input was malformed (bad base64url, truncated tl, unknown `file_type`, etc)
- **`UnsupportedFileIdVersionError`** — the `file_id`'s major/minor version is newer than what `@puregram/file-id` knows how to parse. **open an issue when you hit this** — telegram has bumped the format

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

<a name='low-level'></a>
### low-level encoding helpers

if you're doing something exotic — implementing a TDLib-flavored format yourself, or shipping a custom serializer — the encoding primitives `@puregram/file-id` builds on top of are also exported:

| export | purpose |
|---|---|
| `base64urlEncode(bytes)` / `base64urlDecode(str)` | TDLib's url-safe base64 (no padding) |
| `rleEncode(bytes)` / `rleDecode(bytes)` | run-length encoding for zero-bytes; what telegram applies before base64url |
| `packTlString(str)` / `unpackTlString(reader)` | TL string framing (length prefix, alignment) |
| `BinaryReader` / `BinaryWriter` | little-endian bigint-aware reader/writer |

these are stable but very low-level. if you reach for them, you probably want to read [`packages/file-id/src`](src) first

---

## constants

- `SUPPORTED_VERSIONS` — readonly tuple of `[majorVersion, subVersion]` pairs the parser accepts
- `FILE_REFERENCE_FLAG` — `0x02000000`, the high-bit flag in the type id meaning "this id has a fresh file_reference"
- `WEB_LOCATION_FLAG` — `0x01000000`, the high-bit flag meaning "this id is a web location"

these come up when you want to twiddle the type byte by hand or write a fixture
