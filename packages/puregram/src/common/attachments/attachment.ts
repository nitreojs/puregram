import { inspectable } from 'inspectable'

import { AttachmentType } from '../../types/types'

/** Simple attachment */
export class Attachment {
  attachmentType?: AttachmentType

  get [Symbol.toStringTag]() {
    return this.constructor.name
  }
}

inspectable(Attachment, {
  serialize() {
    return {}
  }
})
