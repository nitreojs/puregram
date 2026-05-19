import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

import { type MediaInput, MediaSourceType } from 'puregram'

/** sha-256 of arbitrary bytes as lowercase hex */
export function hashBytes (bytes: Buffer | Uint8Array | ArrayBufferLike) {
  const hasher = createHash('sha256')

  if (Buffer.isBuffer(bytes)) {
    hasher.update(bytes)
  } else if (bytes instanceof Uint8Array) {
    hasher.update(bytes)
  } else {
    hasher.update(new Uint8Array(bytes))
  }

  return hasher.digest('hex')
}

/** computes a sha-256 hex digest of the bytes a `MediaInput` resolves to */
export async function hashMediaInput (media: MediaInput, fetchImpl: typeof fetch = fetch) {
  if (media.type === MediaSourceType.Buffer) {
    return hashBytes(media.value)
  }

  if (media.type === MediaSourceType.ArrayBuffer) {
    return hashBytes(media.value)
  }

  if (media.type === MediaSourceType.Path) {
    const buf = await readFile(media.value)

    return hashBytes(buf)
  }

  if (media.type === MediaSourceType.Url) {
    const res = await fetchImpl(media.value)

    if (!res.ok) {
      throw new Error(`mediaCacher: hash fetch failed for ${media.value} (status ${res.status})`)
    }

    const ab = await res.arrayBuffer()

    return hashBytes(ab)
  }

  // streams and File are intentionally not supported: they're not deterministically replayable
  throw new TypeError(`mediaCacher: cannot hash MediaSource of type "${media.type}" — use Buffer/Path/Url/ArrayBuffer`)
}
