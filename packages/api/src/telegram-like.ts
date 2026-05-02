import type { Readable } from 'node:stream'

import type { ApiMethods } from './generated/api-methods'
import type { TelegramPhotoSize } from './generated/types'

/**
 * structural target for `tg.download(...)` — matches what update-class extras
 * produce. the public `DownloadTarget` in `puregram` is wider (adds
 * `MediaSourceFileId` and `Photo`)
 */
export type DownloadableLike =
  | string
  | { file_id: string, file_path?: string | undefined }
  | { fileId: string, filePath?: string | undefined }
  | TelegramPhotoSize[]

export interface TelegramLike {
  readonly api: {
    [K in keyof ApiMethods]: ApiMethods[K] extends (...args: infer A) => infer R
      ? (...args: A) => R
      : never
  } & {
    call: (method: string, params?: Record<string, unknown>) => Promise<unknown>
  }

  download: (target: DownloadableLike) => Promise<Buffer>
  downloadStream: (target: DownloadableLike) => Promise<Readable>
  downloadIterable: (target: DownloadableLike) => Promise<AsyncIterable<Uint8Array>>
  downloadToFile: (path: string, target: DownloadableLike) => Promise<void>
  getFileURL: (target: DownloadableLike) => Promise<string>
}
