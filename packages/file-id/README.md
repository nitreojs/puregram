# @puregram/file-id

parse and serialize telegram `file_id` and `file_unique_id` strings as typed objects.

```ts
import {
  fileUniqueIdFromFileId,
  isStickerFileId,
  parseFileId,
  serializeFileId,
  serializeFileUniqueId
} from '@puregram/file-id'

const file = parseFileId('CAACAgIAAxkBAAIEol9yQhBqFnT4HXldAh31a-hYXuDIAAIECwACAoujAAFFn1sl9AABHbkbBA')

if (isStickerFileId(file)) {
  console.log(file.id, file.dcId, file.accessHash)
}

// round-trip is byte-equal for supported versions
serializeFileId(file) === file.source

// derive the matching file_unique_id
const unique = fileUniqueIdFromFileId(file)

console.log(serializeFileUniqueId(unique))
```

a class-style facade is also available:

```ts
import { FileId } from '@puregram/file-id'

const fid = FileId.from('CAACAgIAAxkBAAIEol9yQhBqFnT4HXldAh31a-hYXuDIAAIECwACAoujAAFFn1sl9AABHbkbBA')

fid.toString()              // round-trips to the original string
fid.toUniqueId().toString() // canonical file_unique_id for cache keys
```

## supported versions

`(version, sub_version)` pairs that round-trip exactly:

- `(2, 0)`
- `(4, 22)`
- `(4, 27)`
- `(4, 30)` — currently emitted by Bot API 9.6

newer file_ids are parsed best-effort. if the Bot API ever bumps to TDLib's post-`RemovePhotoVolumeAndLocalId` format, this package will need a follow-up release.

## non-goals

- not a TDLib client; we never call telegram with these ids
- not tied to `puregram` or `@puregram/api`; can be used standalone

## license

WTFPL.
