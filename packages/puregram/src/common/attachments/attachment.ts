import { Inspectable } from 'inspectable'

import type { Structure } from '../../types/interfaces'
import type { AttachmentType, MaybeArray, SoftString } from '../../types/types'
import type { AttachmentsMapping } from '../../types/mappings'

/** Simple attachment */
@Inspectable()
export class Attachment implements Structure {
  attachmentType?: AttachmentType

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  is <T extends AttachmentType> (rawTypes: MaybeArray<SoftString<T>>): this is AttachmentsMapping[T] {
    const types = Array.isArray(rawTypes)
      ? rawTypes
      : [rawTypes]

    if (this.attachmentType === undefined) {
      return false
    }

    return types.includes(this.attachmentType)
  }

  toJSON (): Record<string, any> {
    throw new Error('toJSON not implemented')
  }
}
