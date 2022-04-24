import { inspectable } from 'inspectable'

import { PhotoSize } from '../structures/photo-size'

import { Attachment } from './attachment'

/** This object represents a photo file with it's sizes */
export class PhotoAttachment extends Attachment {
  private payload: PhotoSize[]

  private readonly sorted: PhotoSize[]

  attachmentType: 'photo' = 'photo'

  constructor(payload: PhotoSize[]) {
    super()

    this.payload = payload

    this.sorted = [...this.payload].sort(
      (first: PhotoSize, second: PhotoSize) => (
        (second.width * second.height) - (first.width * first.height)
      )
    )
  }

  /** Photo sizes */
  get sizes(): PhotoSize[] {
    return this.payload
  }

  /** Biggest size of the photo */
  get bigSize(): PhotoSize {
    return this.sorted[0]
  }

  /** Medium size of the photo */
  get mediumSize(): PhotoSize {
    return this.sorted[Math.floor(this.sorted.length / 2)]
  }

  /** Smallest size of the photo */
  get smallSize(): PhotoSize {
    return this.sorted[this.sorted.length - 1]
  }
}

inspectable(PhotoAttachment, {
  serialize(photo: PhotoAttachment) {
    return {
      sizes: photo.sizes,
      bigSize: photo.bigSize,
      mediumSize: photo.mediumSize,
      smallSize: photo.smallSize
    }
  }
})
