let { inspect } = require('util');

class VenueAttachment {
  constructor(payload) {
    this.payload = payload;
  }

  get type() {
    return 'venue';
  }

  get location() {
    return this.payload.location;
  }

  get title() {
    return this.payload.title;
  }

  get address() {
    return this.payload.address;
  }

  get foursquareId() {
    return this.payload.foursquare_id || null;
  }

  get foursquareType() {
    return this.payload.foursquare_type || null;
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      location: this.location,
      title: this.title,
      address: this.address,
      foursquareId: this.foursquareId,
      foursquareType: this.foursquareType,
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = VenueAttachment;
