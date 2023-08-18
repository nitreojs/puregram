import { AttachmentType } from '../../types/types'
import { applyMixins } from '../../utils/helpers'
import { Story } from '../structures/story'

import { Attachment } from './attachment'

class StoryAttachment extends Story {
  attachmentType: AttachmentType = 'story'

  toJSON () {
    return this.payload
  }
}

interface StoryAttachment extends Attachment { }
applyMixins(StoryAttachment, [Attachment])

export { StoryAttachment }
