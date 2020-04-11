let { inspect } = require('util');

class PhotoAttachment extends Array {
  constructor(...sizes) {
    super(...sizes);

    this.sizes = sizes;
    
    this.sorted = this.sort(
      (a, b) => (b.width * b.height) - (a.width * a.height)
    );
  }

  get type() {
    return 'photo';
  }

  get big() {
    return this.sorted[0];
  }

  get small() {
    return this.sorted[this.sorted.length - 1];
  }

  get medium() {
    return this.sorted[Math.floor(this.sorted.length / 2)];
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payload = inspect(this.sizes, { ...options, compact: false });

    return `${options.stylize(`${name}(${this.sizes.length})`, 'special')} ${payload}`;
  }
}

module.exports = PhotoAttachment;