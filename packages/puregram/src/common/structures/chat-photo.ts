import { inspectable } from 'inspectable'

import { TelegramChatPhoto } from '../../telegram-interfaces'

/** This object represents a chat photo. */
export class ChatPhoto {
  constructor(private payload: TelegramChatPhoto) { }

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /**
   * File identifier of small (`160x160`) chat photo.
   * This `file_id` can be used only for photo download and only for as long
   * as the photo is not changed.
   */
  get smallFileId() {
    return this.payload.small_file_id
  }

  /**
   * Unique file identifier of small (`160x160`) chat photo, which is supposed
   * to be the same over time and for different bots. Can't be used to download
   * or reuse the file.
   */
  get smallFileUniqueId() {
    return this.payload.small_file_unique_id
  }

  /**
   * File identifier of big (`640x640`) chat photo. This `file_id` can be used
   * only for photo download and only for as long as the photo is not changed.
   */
  get bigFileId() {
    return this.payload.big_file_id
  }

  /**
   * Unique file identifier of big (`640x640`) chat photo, which is supposed
   * to be the same over time and for different bots. Can't be used to
   * download or reuse the file.
   */
  get bigFileUniqueId() {
    return this.payload.big_file_unique_id
  }
}

inspectable(ChatPhoto, {
  serialize(photo: ChatPhoto) {
    return {
      smallFileId: photo.smallFileId,
      smallFileUniqueId: photo.smallFileUniqueId,
      bigFileId: photo.bigFileId,
      bigFileUniqueId: photo.bigFileUniqueId
    }
  }
})
