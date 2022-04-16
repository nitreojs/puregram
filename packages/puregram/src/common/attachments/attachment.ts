import { inspectable } from 'inspectable'

import { AttachmentType } from '../../types'

/** Simple attachment */
export class Attachment {
  public attachmentType?: AttachmentType

  public get [Symbol.toStringTag](): string {
    return this.constructor.name
  }
}

inspectable(Attachment, {
  serialize() {
    return {}
  }
})
