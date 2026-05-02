import { createWriteStream } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

import { Photo } from '@puregram/api'
import type { TelegramFile, TelegramPhotoSize } from '@puregram/api'

import type { HttpClient, HttpDownloadResponse } from '../http/client'
import type { MediaSourceFileId } from '../media-source'
import { MediaSourceType } from '../media-source'
import type { ResolvedTelegramOptions } from '../options'

/**
 * any value resolvable to a telegram file URL — raw `file_id`, `MediaSource.fileId(...)`,
 * any wrapper with `fileId`, any payload with `file_id`, or `Photo` / `TelegramPhotoSize[]`
 * (largest auto-picked). other `MediaSource.X(...)` upload variants throw `TypeError`
 */
export type DownloadTarget =
  | string
  | MediaSourceFileId
  | { file_id: string, file_path?: string | undefined }
  | { fileId: string, filePath?: string | undefined }
  | Photo
  | TelegramPhotoSize[]

interface ResolvedTarget {
  fileId: string
  filePath?: string
}

interface DownloadDeps {
  options: ResolvedTelegramOptions
  httpClient: HttpClient
  getFile: (fileId: string) => Promise<TelegramFile>
}

const UPLOAD_ONLY_VARIANTS = new Set<string>([
  MediaSourceType.Path,
  MediaSourceType.Url,
  MediaSourceType.Buffer,
  MediaSourceType.Stream,
  MediaSourceType.File,
  MediaSourceType.ArrayBuffer
])

function pickLargest (sizes: readonly TelegramPhotoSize[]) {
  if (sizes.length === 0) {
    throw new TypeError('cannot download from an empty photo size array')
  }

  return sizes.reduce((acc, cur) => (sizeKey(cur) > sizeKey(acc) ? cur : acc))
}

function sizeKey (raw: TelegramPhotoSize) {
  return raw.file_size ?? raw.width * raw.height
}

/** resolve any supported target shape into `{fileId, filePath?}` */
export function resolveDownloadTarget (target: DownloadTarget): ResolvedTarget {
  if (typeof target === 'string') {
    return { fileId: target }
  }

  if (Array.isArray(target)) {
    return resolveDownloadTarget(pickLargest(target))
  }

  if (target instanceof Photo) {
    return resolveDownloadTarget(target.biggest.raw)
  }

  // only the fileId variant is downloadable; upload-only variants throw
  const envelope = readEnvelope(target)

  if (envelope !== undefined) {
    if (envelope.type === String(MediaSourceType.FileId)) {
      return { fileId: String(envelope.value) }
    }

    throw new TypeError(
      `cannot download from a "${envelope.type}" media source — that variant is for uploads`
    )
  }

  // duck-type both wrapper (camelCase) and raw payload (snake_case) shapes
  const fileId = (target as { fileId?: unknown }).fileId ??
    (target as { file_id?: unknown }).file_id
  const filePath = (target as { filePath?: unknown }).filePath ??
    (target as { file_path?: unknown }).file_path

  if (typeof fileId !== 'string') {
    throw new TypeError('download target has no file_id')
  }

  return typeof filePath === 'string' ? { fileId, filePath } : { fileId }
}

function readEnvelope (value: unknown) {
  if (typeof value !== 'object' || value === null) {
    return undefined
  }

  const type = (value as { type?: unknown }).type

  if (typeof type !== 'string') {
    return undefined
  }

  if (type !== String(MediaSourceType.FileId) && !UPLOAD_ONLY_VARIANTS.has(type)) {
    return undefined
  }

  return { type, value: (value as { value?: unknown }).value }
}

/** build the public download URL — resolves `file_path` via `getFile` when the target didn't carry one */
export async function getFileURL (deps: DownloadDeps, target: DownloadTarget) {
  const resolved = resolveDownloadTarget(target)
  const filePath = resolved.filePath ?? (await deps.getFile(resolved.fileId)).file_path

  if (filePath === undefined) {
    throw new TypeError(`bot api returned no file_path for file_id "${resolved.fileId}"`)
  }

  if (deps.options.useLocal) {
    // local bot-api server returns absolute on-disk paths in `file_path`
    return filePath
  }

  // strip trailing `/bot` from `apiBaseUrl` and rebuild as the file endpoint
  const base = deps.options.apiBaseUrl.replace(/\/bot$/, '')

  return `${base}/file/bot${deps.options.token}/${filePath}`
}

async function fetchBody (deps: DownloadDeps, url: string) {
  const client = deps.httpClient
  const fn = client.download?.bind(client) ?? defaultDownload

  return fn(url)
}

async function defaultDownload (url: string) {
  const response = await fetch(url)

  return { status: response.status, body: response.body }
}

function ensureBody (response: HttpDownloadResponse, url: string) {
  if (response.status >= 400) {
    throw new Error(`download failed: GET ${url} → ${response.status}`)
  }

  if (response.body === null) {
    throw new Error(`download failed: GET ${url} → empty body`)
  }

  return response.body
}

/** download into a `Buffer` (most common case) */
export async function download (deps: DownloadDeps, target: DownloadTarget) {
  const url = await getFileURL(deps, target)

  if (deps.options.useLocal) {
    return readFile(url)
  }

  const response = await fetchBody(deps, url)
  const body = ensureBody(response, url)
  const chunks: Uint8Array[] = []

  for await (const chunk of body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}

/** download as a node `Readable` stream */
export async function downloadStream (deps: DownloadDeps, target: DownloadTarget) {
  const url = await getFileURL(deps, target)

  if (deps.options.useLocal) {
    const { createReadStream } = await import('node:fs')

    return createReadStream(url)
  }

  const response = await fetchBody(deps, url)
  const body = ensureBody(response, url)

  return Readable.fromWeb(body as never)
}

/** download as an async-iterable byte stream (zero buffering) */
export async function downloadIterable (deps: DownloadDeps, target: DownloadTarget) {
  const stream = await downloadStream(deps, target)

  return stream as AsyncIterable<Uint8Array>
}

/** download and write straight to disk */
export async function downloadToFile (deps: DownloadDeps, path: string, target: DownloadTarget) {
  const stream = await downloadStream(deps, target)

  await pipeline(stream, createWriteStream(path))
}
