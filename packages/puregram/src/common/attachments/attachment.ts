import { inspectable } from 'inspectable'

import { AttachmentType } from '../../types'

/** Simple attachment */
export class Attachment {
  attachmentType?: AttachmentType

  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }
}

inspectable(Attachment, {
  serialize() {
    return {}
  }
})
