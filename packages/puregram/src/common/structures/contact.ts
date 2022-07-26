import { inspectable } from 'inspectable'

import * as Interfaces from '../../generated/telegram-interfaces'
import { filterPayload } from '../../utils/helpers'

import { Structure } from '../../types/interfaces'

/** This object represents a phone contact. */
export class Contact implements Structure {
  constructor (private payload: Interfaces.TelegramContact) { }

  get [Symbol.toStringTag] () {
    return this.constructor.name
  }

  /** Contact's phone number */
  get phoneNumber () {
    return this.payload.phone_number
  }

  /** Contact's first name */
  get firstName () {
    return this.payload.first_name
  }

  /** Contact's last name */
  get lastName () {
    return this.payload.last_name
  }

  /** Contact's user identifier in Telegram */
  get userId () {
    return this.payload.user_id
  }

  /** Additional data about the contact in the form of a vCard */
  get vCard () {
    return this.payload.vcard
  }

  toJSON (): Interfaces.TelegramContact {
    return {
      phone_number: this.phoneNumber,
      first_name: this.firstName,
      last_name: this.lastName,
      user_id: this.userId,
      vcard: this.vCard
    }
  }
}

inspectable(Contact, {
  serialize (struct) {
    const payload = {
      phoneNumber: struct.phoneNumber,
      firstName: struct.firstName,
      lastName: struct.lastName,
      userId: struct.userId,
      vCard: struct.vCard
    }

    return filterPayload(payload)
  }
})
