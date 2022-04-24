import { inspectable } from 'inspectable'

import { TelegramContact } from '../../telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

/** This object represents a phone contact. */
export class Contact {
  constructor(private payload: TelegramContact) { }

  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /** Contact's phone number */
  get phoneNumber(): string {
    return this.payload.phone_number
  }

  /** Contact's first name */
  get firstName(): string {
    return this.payload.first_name
  }

  /** Contact's last name */
  get lastName(): string | undefined {
    return this.payload.last_name
  }

  /** Contact's user identifier in Telegram */
  get userId(): number | undefined {
    return this.payload.user_id
  }

  /** Additional data about the contact in the form of a vCard */
  get vCard(): string | undefined {
    return this.payload.vcard
  }
}

inspectable(Contact, {
  serialize(contact: Contact) {
    const payload = {
      phoneNumber: contact.phoneNumber,
      firstName: contact.firstName,
      lastName: contact.lastName,
      userId: contact.userId,
      vCard: contact.vCard
    }

    return filterPayload(payload)
  }
})
