import { AttachmentType } from '../../types/types'
import { applyMixins } from '../../utils/helpers'

import { Location } from '../structures/location'

import { Attachment } from './attachment'

class LocationAttachment extends Location {
  attachmentType: AttachmentType = 'location'

  toJSON () {
    return this.payload
  }
}

interface LocationAttachment extends Attachment { }
applyMixins(LocationAttachment, [Attachment])

export { LocationAttachment }
