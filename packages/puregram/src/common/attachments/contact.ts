import { AttachmentType } from '../../types/types'
import { applyMixins } from '../../utils/helpers'

import { Contact } from '../structures/contact'

import { Attachment } from './attachment'

class ContactAttachment extends Contact {
  attachmentType: AttachmentType = 'contact'

  toJSON () {
    return this.payload
  }
}

interface ContactAttachment extends Attachment { }
applyMixins(ContactAttachment, [Attachment])

export { ContactAttachment }
