let { inspect } = require('util');

class LocationAttachment {
  constructor(payload) {
    this.payload = payload;
  }

  get type() {
    return 'location';
  }

  get longitude() {
    return this.payload.longitude;
  }

  get latitude() {
    return this.payload.latitude;
  }

  toString() {
    return `${this.longitude},${this.latitude}`;
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      longitude: this.longitude,
      latitude: this.latitude,
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} <${options.stylize(this.toString(), 'string')}> ${payload}`;
  }
}

module.exports = LocationAttachment;
