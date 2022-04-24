import { inspectable } from 'inspectable'

import { TelegramUserProfilePhotos, TelegramPhotoSize } from '../../telegram-interfaces'

import { PhotoSize } from './photo-size'

/** This object represent a user's profile pictures. */
export class UserProfilePhotos {
  constructor(private payload: TelegramUserProfilePhotos) { }

  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /** Total number of profile pictures the target user has */
  get totalCount(): number {
    return this.payload.total_count
  }

  /** Requested profile pictures (in up to 4 sizes each) */
  get photos(): PhotoSize[][] {
    const { photos } = this.payload

    if (!photos.length) {
      return []
    }

    return photos.map(
      (row: TelegramPhotoSize[]) => row.map(
        (element: TelegramPhotoSize) => new PhotoSize(element)
      )
    )
  }
}

inspectable(UserProfilePhotos, {
  serialize(photos: UserProfilePhotos) {
    return {
      totalCount: photos.totalCount,
      photos: photos.photos
    }
  }
})
