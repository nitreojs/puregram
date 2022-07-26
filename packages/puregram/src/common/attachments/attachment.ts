import { inspectable } from 'inspectable'

import { Structure } from '../../types/interfaces'
import { AttachmentType } from '../../types/types'

/** Simple attachment */
export class Attachment implements Structure {
  attachmentType?: AttachmentType

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  toJSON (): Record<string, any> {
    throw new Error('toJSON not implemented')
  }
}

inspectable(Attachment, {
  serialize () {
    return {}
  }
})
