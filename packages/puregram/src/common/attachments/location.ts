import { AttachmentType } from '../../types/types'
import { applyMixins } from '../../utils/helpers'

import { Location } from '../structures'

import { Attachment } from './attachment'

class LocationAttachment extends Location {
  attachmentType: AttachmentType = 'location'
}

interface LocationAttachment extends Attachment { }
applyMixins(LocationAttachment, [Attachment])

export { LocationAttachment }
