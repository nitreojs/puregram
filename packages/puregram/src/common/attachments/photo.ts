import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { AttachmentType } from '../../types/types'

import { PhotoSize } from '../structures'

import { Attachment } from './attachment'

/** This object represents a photo file with it's sizes */
export class PhotoAttachment extends Attachment {
  private payload: PhotoSize[]

  private readonly sorted: PhotoSize[]

  attachmentType: AttachmentType = 'photo'

  constructor (payload: PhotoSize[]) {
    super()

    this.payload = payload

    this.sorted = [...this.payload].sort(
      (first, second) => (second.width * second.height) - (first.width * first.height)
    )
  }

  /** Photo sizes */
  get sizes () {
    return this.payload
  }

  /** Biggest size of the photo */
  get bigSize () {
    return this.sorted[0]
  }

  /** Medium size of the photo */
  get mediumSize () {
    return this.sorted[Math.floor(this.sorted.length / 2)]
  }

  /** Smallest size of the photo */
  get smallSize () {
    return this.sorted[this.sorted.length - 1]
  }

  toJSON (): Interfaces.TelegramPhotoSize[] {
    return [
      this.smallSize.toJSON(),
      this.mediumSize.toJSON(),
      this.bigSize.toJSON()
    ]
  }
}

inspectable(PhotoAttachment, {
  serialize (attachment) {
    return {
      smallSize: attachment.smallSize,
      mediumSize: attachment.mediumSize,
      bigSize: attachment.bigSize
    }
  }
})
