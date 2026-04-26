import { Readable } from 'node:stream'
import { fileFromPath } from 'formdata-node/file-from-path'
import { File, FormData } from 'formdata-node'
import { FormDataEncoder } from 'form-data-encoder'

import { MediaSourceType, isMediaInput, type MediaInput } from '../media-source'

export const MEDIA_PARAM_KEYS: ReadonlySet<string> = new Set([
  'thumb', 'photo', 'audio', 'document', 'voice', 'video', 'animation',
  'video_note', 'sticker', 'png_sticker', 'tgs_sticker', 'webm_sticker',
  'certificate'
])

export function needsMultipart (params: Record<string, unknown>): boolean {
  if ('media' in params) return true
  for (const key of Object.keys(params)) {
    if (MEDIA_PARAM_KEYS.has(key)) return true
  }
  return false
}

export function generateAttachId (): string {
  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

export async function resolveMediaInput (input: MediaInput): Promise<File | string> {
  const filename = input.filename ?? 'file.dat'

  if (input.type === MediaSourceType.FileId) return input.value
  if (input.type === MediaSourceType.File) return input.value
  if (input.type === MediaSourceType.Path) return fileFromPath(input.value, input.filename)

  if (input.type === MediaSourceType.Stream) {
    const chunks: Uint8Array[] = []
    for await (const chunk of input.value) chunks.push(new Uint8Array(chunk as Buffer))
    return new File([Buffer.concat(chunks)], filename)
  }

  if (input.type === MediaSourceType.Buffer) return new File([new Uint8Array(input.value)], filename)
  if (input.type === MediaSourceType.ArrayBuffer) return new File([input.value], filename)

  if (input.type === MediaSourceType.Url) {
    if (input.forceUpload) {
      const isUrl = /^https?:\/\//i.test(input.value)
      if (!isUrl) throw new TypeError(`'${input.value}' is not a valid URL`)
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

export async function buildSimpleMultipart (params: Record<string, unknown>): Promise<MultipartResult> {
  const fd = new FormData()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    if (key === 'suppress') continue

    if (isMediaInput(value)) {
      const resolved = await resolveMediaInput(value)
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
  return { body: Readable.from(encoder), headers: encoder.headers }
}

export async function buildMediaGroupMultipart (params: Record<string, unknown>): Promise<MultipartResult> {
  const fd = new FormData()

  const original = params.media as Record<string, unknown> | Record<string, unknown>[]
  const entries = Array.isArray(original) ? original : [original]
  const rewritten: Record<string, unknown>[] = []

  for (const entry of entries) {
    rewritten.push(await rewriteAttach(fd, entry))
  }

  fd.set('media', JSON.stringify(Array.isArray(original) ? rewritten : rewritten[0]))

  for (const [key, value] of Object.entries(params)) {
    if (key === 'media' || key === 'suppress') continue
    if (value === undefined || value === null) continue
    fd.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
  }

  const encoder = new FormDataEncoder(fd)
  return { body: Readable.from(encoder), headers: encoder.headers }
}

async function rewriteAttach (fd: FormData, input: Record<string, unknown>): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = { ...input }

  for (const key of ['media', 'thumb'] as const) {
    const value = out[key]
    if (!isMediaInput(value)) continue

    if (value.type === MediaSourceType.FileId || (value.type === MediaSourceType.Url && !('forceUpload' in value && value.forceUpload))) {
      out[key] = (value as { value: string }).value
      continue
    }

    const id = generateAttachId()
    const resolved = await resolveMediaInput(value)
    fd.set(id, resolved as never)
    out[key] = `attach://${id}`
  }

  return out
}
