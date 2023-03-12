import { AttachmentType } from '../../types/types'
import { applyMixins } from '../../utils/helpers'

import { Poll } from '../structures/poll'

import { Attachment } from './attachment'

class PollAttachment extends Poll {
  attachmentType: AttachmentType = 'poll'

  toJSON () {
    return this.payload
  }
}

interface PollAttachment extends Attachment { }
applyMixins(PollAttachment, [Attachment])

export { PollAttachment }
