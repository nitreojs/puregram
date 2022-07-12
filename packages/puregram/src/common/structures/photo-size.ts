import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

/** This object represents one size of a photo or a file / sticker thumbnail */
export class PhotoSize {
  constructor (private payload: Interfaces.TelegramPhotoSize) { }

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

  /** Photo width */
  get width () {
    return this.payload.width
  }

  /** Photo height */
  get height () {
    return this.payload.height
  }

  /** File size */
  get fileSize () {
    return this.payload.file_size
  }
}

inspectable(PhotoSize, {
  serialize (struct) {
    const payload = {
      fileId: struct.fileId,
      fileUniqueId: struct.fileUniqueId,
      width: struct.width,
      height: struct.height,
      fileSize: struct.fileSize
    }

    return filterPayload(payload)
  }
})
