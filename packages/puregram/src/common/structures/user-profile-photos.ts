import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { PhotoSize } from './photo-size'

/** This object represent a user's profile pictures. */
export class UserProfilePhotos {
  constructor (private payload: Interfaces.TelegramUserProfilePhotos) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Total number of profile pictures the target user has */
  get totalCount () {
    return this.payload.total_count
  }

  /** Requested profile pictures (in up to 4 sizes each) */
  get photos () {
    const { photos } = this.payload

    if (!photos.length) {
      return []
    }

    return photos.map(
      (row: Interfaces.TelegramPhotoSize[]) => row.map(
        (element: Interfaces.TelegramPhotoSize) => new PhotoSize(element)
      )
    )
  }
}

inspectable(UserProfilePhotos, {
  serialize (struct) {
    return {
      totalCount: struct.totalCount,
      photos: struct.photos
    }
  }
})
