let { inspect } = require('util');

class ContactAttachment {
  constructor(payload) {
    this.payload = payload;
  }

  get type() {
    return 'contact';
  }

  get phoneNumber() {
    return this.payload.phone_number;
  }

  get firstName() {
    return this.payload.first_name;
  }

  get lastName() {
    return this.payload.last_name;
  }

  get userId() {
    return this.payload.user_id;
  }

  get vcard() {
    return this.payload.vcard;
  }

  toString() {
    return `${this.firstName} ${this.lastName} ${this.phoneNumber}`;
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      phoneNumber: this.phoneNumber,
      firstName: this.firstName,
      lastName: this.lastName,
      userId: this.userId,
      vcard: this.vcard,
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} <${options.stylize(this.toString(), 'string')}> ${payload}`;
  }
}

module.exports = ContactAttachment;
