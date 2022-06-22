import { AttachmentType } from '../../types/types'
import { applyMixins } from '../../utils/helpers'

import { Contact } from '../structures'

import { Attachment } from './attachment'

class ContactAttachment extends Contact {
  attachmentType: AttachmentType = 'contact'
}

interface ContactAttachment extends Attachment { }
applyMixins(ContactAttachment, [Attachment])

export { ContactAttachment }
