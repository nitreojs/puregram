import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { Structure } from '../../types/interfaces'

/** This object represents a file ready to be downloaded. The file can be downloaded via the link `https://api.telegram.org/file/bot<token>/<file_path>`. It is guaranteed that the link will be valid for at least 1 hour. When the link expires, a new one can be requested by calling `getFile`. */
export class File implements Structure {
  constructor (public payload: Interfaces.TelegramFile) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /**
   * Identifier for this file, which can be used to download or reuse the file
   */
  get fileId () {
    return this.payload.file_id
  }

  /**
   * Unique identifier for this file, which is supposed to be the same over
   * time and for different bots. Can't be used to download or reuse the file.
   */
  get fileUniqueId () {
    return this.payload.file_unique_id
  }

  /** File size, if known */
  get fileSize () {
    return this.payload.file_size
  }

  /**
   * File path.
   * Use `https://api.telegram.org/file/bot<token>/<file_path>` to get the
   * file.
   */
  get filePath () {
    return this.payload.file_path
  }

  toJSON () {
    return this.payload
  }
}

inspectable(File, {
  serialize (struct) {
    const payload = {
      fileId: struct.fileId,
      fileUniqueId: struct.fileUniqueId,
      fileSize: struct.fileSize,
      filePath: struct.filePath
    }

    return filterPayload(payload)
  }
})
