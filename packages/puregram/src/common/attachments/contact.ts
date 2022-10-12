import * as Interfaces from '../../generated/telegram-interfaces'

import { AttachmentType } from '../../types/types'
import { applyMixins } from '../../utils/helpers'

import { Contact } from '../structures'

import { Attachment } from './attachment'

class ContactAttachment extends Contact {
  attachmentType: AttachmentType = 'contact'

  toJSON (): Interfaces.TelegramContact {
    return {
      first_name: this.firstName,
      phone_number: this.phoneNumber,
      last_name: this.lastName,
      user_id: this.userId,
      vcard: this.vCard
    }
  }
}

interface ContactAttachment extends Attachment { }
applyMixins(ContactAttachment, [Attachment])

export { ContactAttachment }
