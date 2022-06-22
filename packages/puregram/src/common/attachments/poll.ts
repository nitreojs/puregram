import { AttachmentType } from '../../types/types'
import { applyMixins } from '../../utils/helpers'

import { Poll } from '../structures'

import { Attachment } from './attachment'

class PollAttachment extends Poll {
  attachmentType: AttachmentType = 'poll'
}

interface PollAttachment extends Attachment { }
applyMixins(PollAttachment, [Attachment])

export { PollAttachment }
