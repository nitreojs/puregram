import { Inspect, Inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'

import { Structure } from '../../types/interfaces'

import { PhotoSize } from './photo-size'

/** This object represent a user's profile pictures. */
@Inspectable()
export class UserProfilePhotos implements Structure {
  constructor (public payload: Interfaces.TelegramUserProfilePhotos) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Total number of profile pictures the target user has */
  @Inspect()
  get totalCount () {
    return this.payload.total_count
  }

  /** Requested profile pictures (in up to 4 sizes each) */
  @Inspect({ nullable: false })
  get photos () {
    const { photos } = this.payload

    if (!photos.length) {
      return
    }

    return photos.map(row => row.map(element => new PhotoSize(element)))
  }

  toJSON () {
    return this.payload
  }
}
