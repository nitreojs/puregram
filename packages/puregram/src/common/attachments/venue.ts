import { AttachmentType } from '../../types/types'
import { applyMixins } from '../../utils/helpers'

import { Venue } from '../structures/venue'

import { Attachment } from './attachment'

class VenueAttachment extends Venue {
  attachmentType: AttachmentType = 'venue'

  toJSON () {
    return this.payload
  }
}

interface VenueAttachment extends Attachment { }
applyMixins(VenueAttachment, [Attachment])

export { VenueAttachment }
