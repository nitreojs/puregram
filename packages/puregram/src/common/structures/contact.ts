import { inspectable } from 'inspectable';

import { TelegramContact } from '../../interfaces';
import { filterPayload } from '../../utils/helpers';

/** This object represents a phone contact. */
export class Contact {
  private payload: TelegramContact;

  constructor(payload: TelegramContact) {
    this.payload = payload;
  }

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** Contact's phone number */
  public get phoneNumber(): string {
    return this.payload.phone_number;
  }

  /** Contact's first name */
  public get firstName(): string {
    return this.payload.first_name;
  }

  /** Contact's last name */
  public get lastName(): string | undefined {
    return this.payload.last_name;
  }

  /** Contact's user identifier in Telegram */
  public get userId(): number | undefined {
    return this.payload.user_id;
  }

  /** Additional data about the contact in the form of a vCard */
  public get vCard(): string | undefined {
    return this.payload.vcard;
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
    };

    return filterPayload(payload);
  }
});
