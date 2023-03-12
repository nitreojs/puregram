import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { PhotoSize } from './photo-size'

/** This object represent a user's profile pictures. */
export class UserProfilePhotos implements Structure {
  constructor (public payload: Interfaces.TelegramUserProfilePhotos) { }

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
      return
    }

    return photos.map(row => row.map(element => new PhotoSize(element)))
  }

  toJSON (): Interfaces.TelegramUserProfilePhotos {
    return {
      photos: this.photos?.map(row => row.map(size => size.toJSON())) ?? [],
      total_count: this.totalCount
    }
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
