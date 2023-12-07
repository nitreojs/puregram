import { Inspectable } from 'inspectable'

import type { Structure } from '../../types/interfaces'
import type { AttachmentType } from '../../types/types'

/** Simple attachment */
@Inspectable()
export class Attachment implements Structure {
  attachmentType?: AttachmentType

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  toJSON (): Record<string, any> {
    throw new Error('toJSON not implemented')
  }
}
