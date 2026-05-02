import { createHash } from 'node:crypto'

export interface FileHandle {
  file_id: string
  file_unique_id: string
}

export class FileStore {
  registerBuffer (buf: Buffer | Uint8Array) {
    const hash = createHash('sha256').update(buf).digest('base64url')

    return { file_id: hash, file_unique_id: hash.slice(0, 16) }
  }

  registerFileId (fileId: string) {
    return { file_id: fileId, file_unique_id: fileId.slice(0, 16) }
  }

  registerUrl (url: string) {
    const hash = createHash('sha256').update(url).digest('base64url')

    return { file_id: hash, file_unique_id: hash.slice(0, 16) }
  }
}
