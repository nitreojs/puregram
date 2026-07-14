import { Readable } from 'node:stream'

import type { RichLike } from '@puregram/api'
import { FormDataEncoder } from 'form-data-encoder'
import { File, FormData } from 'formdata-node'

import { MediaSourceType, isMediaInput, type MediaInput } from '../media-source'

export const MEDIA_PARAM_KEYS: ReadonlySet<string> = new Set([
  'thumb', 'photo', 'audio', 'document', 'voice', 'video', 'animation',
  'video_note', 'sticker', 'png_sticker', 'tgs_sticker', 'webm_sticker',
  'certificate'
])

export function needsMultipart (params: Record<string, unknown>) {
  if ('media' in params) {
    return true
  }

  for (const key of Object.keys(params)) {
    if (MEDIA_PARAM_KEYS.has(key)) {
      return true
    }
  }

  return false
}

export function generateAttachId () {
  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

export async function resolveMediaInput (input: MediaInput, useLocal = false) {
  const filename = input.filename ?? 'file.dat'

  if (input.type === MediaSourceType.FileId) {
    return input.value
  }

  if (input.type === MediaSourceType.Local) {
    if (!useLocal) {
      throw new TypeError('MediaSource.local() requires the client to be in local mode (useLocal: true)')
    }

    // local bot api server reads the file off disk — pass a file:// uri, no upload
    const { pathToFileURL } = await import('node:url')

    return pathToFileURL(input.value).href
  }

  if (input.type === MediaSourceType.File) {
    return input.value
  }

  if (input.type === MediaSourceType.Path) {
    // lazy — file-from-path pulls node:fs; keep it off the import graph so core loads on edge
    // eslint-disable-next-line import/no-unresolved -- subpath export resolves at runtime
    const { fileFromPath } = await import('formdata-node/file-from-path')

    return fileFromPath(input.value, input.filename)
  }

  if (input.type === MediaSourceType.Stream) {
    const chunks: Uint8Array[] = []

    for await (const chunk of input.value) {
      chunks.push(new Uint8Array(chunk as Buffer))
    }

    return new File([Buffer.concat(chunks)], filename)
  }

  if (input.type === MediaSourceType.Buffer) {
    return new File([new Uint8Array(input.value)], filename)
  }

  if (input.type === MediaSourceType.ArrayBuffer) {
    return new File([input.value], filename)
  }

  if (input.type === MediaSourceType.Url) {
    if (input.forceUpload) {
      const isUrl = /^https?:\/\//i.test(input.value)

      if (!isUrl) {
        throw new TypeError(`'${input.value}' is not a valid URL`)
      }

      const res = await fetch(input.value)
      const ab = await res.arrayBuffer()

      return new File([ab], filename)
    }

    return input.value
  }

  // exhaustive — every MediaSourceType handled above
  throw new TypeError(`invalid MediaSourceType: ${(input as { type: string }).type}`)
}

export interface MultipartResult {
  body: Readable
  headers: Record<string, string>
}

export async function buildSimpleMultipart (
  params: Record<string, unknown>,
  useLocal = false,
  files?: ReadonlyMap<string, unknown>
) {
  const fd = new FormData()

  if (files !== undefined) {
    for (const [id, resolved] of files) {
      fd.set(id, resolved as never)
    }
  }

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue
    }

    if (key === 'suppress') {
      continue
    }

    if (isMediaInput(value)) {
      const resolved = await resolveMediaInput(value, useLocal)

      fd.set(key, resolved as never)
      continue
    }

    if (typeof value === 'object' && !Buffer.isBuffer(value)) {
      fd.set(key, JSON.stringify(value))
      continue
    }

    fd.set(key, String(value))
  }

  const encoder = new FormDataEncoder(fd)

  return { body: Readable.from(encoder), headers: encoder.headers as Record<string, string> }
}

export async function buildMediaGroupMultipart (
  params: Record<string, unknown>,
  useLocal = false,
  files?: ReadonlyMap<string, unknown>
) {
  const fd = new FormData()

  if (files !== undefined) {
    for (const [id, resolved] of files) {
      fd.set(id, resolved as never)
    }
  }

  const original = params.media as Record<string, unknown> | Record<string, unknown>[]
  const entries = Array.isArray(original) ? original : [original]
  const rewritten: Record<string, unknown>[] = []

  for (const entry of entries) {
    rewritten.push(await rewriteAttach(fd, entry, useLocal))
  }

  fd.set('media', JSON.stringify(Array.isArray(original) ? rewritten : rewritten[0]))

  for (const [key, value] of Object.entries(params)) {
    if (key === 'media' || key === 'suppress') {
      continue
    }

    if (value === undefined || value === null) {
      continue
    }

    fd.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
  }

  const encoder = new FormDataEncoder(fd)

  return { body: Readable.from(encoder), headers: encoder.headers as Record<string, string> }
}

async function rewriteAttach (fd: FormData, input: Record<string, unknown>, useLocal = false) {
  const out: Record<string, unknown> = { ...input }

  for (const key of ['media', 'thumb'] as const) {
    const value = out[key]

    if (!isMediaInput(value)) {
      continue
    }

    out[key] = await rewriteMediaValue(value, useLocal, (id, resolved) => fd.set(id, resolved as never))
  }

  return out
}

async function rewriteMediaValue (
  value: MediaInput,
  useLocal: boolean,
  register: (id: string, resolved: unknown) => void
) {
  if (value.type === MediaSourceType.FileId) {
    return value.value
  }

  if (value.type === MediaSourceType.Url && !value.forceUpload) {
    return value.value
  }

  if (value.type === MediaSourceType.Local) {
    return resolveMediaInput(value, useLocal)
  }

  const id = generateAttachId()
  const resolved = await resolveMediaInput(value)

  register(id, resolved)

  return `attach://${id}`
}

// bot api 10.2 rich messages embed InputMedia objects at arbitrary depth
// (blocks, nested blocks, media[]), so envelopes are resolved by a deep walk
// instead of the fixed-key rewrite media groups use
export async function rewriteRichMessage (params: Record<string, unknown>, useLocal = false) {
  const files = new Map<string, unknown>()
  const value = params.rich_message

  if (value === undefined || value === null) {
    return { params, files }
  }

  const unwrapped = isRichLike(value) ? value.toInputRichMessage() : value

  const rewritten = await rewriteRichNode(unwrapped, files, useLocal, new WeakSet())

  if (rewritten === value) {
    return { params, files }
  }

  return { params: { ...params, rich_message: rewritten }, files }
}

function isRichLike (value: unknown): value is RichLike {
  return typeof value === 'object' && value !== null &&
    'toInputRichMessage' in value && typeof value.toInputRichMessage === 'function'
}

// `isMediaInput` alone is unsafe inside rich content: rich text nodes like
// { type: 'url', url } reuse MediaSourceType strings — envelopes always carry `value`
function isEnvelope (node: object): node is MediaInput {
  return 'value' in node && isMediaInput(node)
}

async function rewriteRichNode (
  node: unknown,
  files: Map<string, unknown>,
  useLocal: boolean,
  path: WeakSet<object>
): Promise<unknown> {
  if (typeof node !== 'object' || node === null || Buffer.isBuffer(node)) {
    return node
  }

  if (isEnvelope(node)) {
    return rewriteMediaValue(node, useLocal, (id, resolved) => files.set(id, resolved))
  }

  // the walk is async, so a cycle would spin the microtask queue into an uncatchable oom
  // instead of a stack overflow — track the current path and fail like JSON.stringify would
  if (path.has(node)) {
    throw new TypeError('rich_message contains a circular reference')
  }

  path.add(node)

  try {
    if (Array.isArray(node)) {
      // Array.isArray narrows to any[]; pin the element type back to unknown
      const items = node as unknown[]
      let out: unknown[] | undefined

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const next = await rewriteRichNode(item, files, useLocal, path)

        if (next !== item) {
          out ??= items.slice()
          out[i] = next
        }
      }

      return out ?? items
    }

    const record = node as Record<string, unknown>
    let out: Record<string, unknown> | undefined

    for (const key of Object.keys(record)) {
      const value = record[key]
      const next = await rewriteRichNode(value, files, useLocal, path)

      if (next !== value) {
        out ??= { ...record }
        out[key] = next
      }
    }

    return out ?? record
  } finally {
    path.delete(node)
  }
}
