import { inspectable } from 'inspectable'

import { TelegramFile } from '../../telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

export class File {
  constructor(private payload: TelegramFile) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /**
   * Identifier for this file, which can be used to download or reuse the file
   */
  get fileId() {
    return this.payload.file_id
  }

  /**
   * Unique identifier for this file, which is supposed to be the same over
   * time and for different bots. Can't be used to download or reuse the file.
   */
  get fileUniqueId() {
    return this.payload.file_unique_id
  }

  /** File size, if known */
  get fileSize() {
    return this.payload.file_size
  }

  /**
   * File path.
   * Use `https://api.telegram.org/file/bot<token>/<file_path>` to get the
   * file.
   */
  get filePath() {
    return this.payload.file_path
  }
}

inspectable(File, {
  serialize(file: File) {
    const payload = {
      fileId: file.fileId,
      fileUniqueId: file.fileUniqueId,
      fileSize: file.fileSize,
      filePath: file.filePath
    }

    return filterPayload(payload)
  }
})
