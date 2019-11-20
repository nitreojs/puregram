let { inspect } = require('util');

class PhotoSize {
  constructor(payload) {
    this.payload = payload;
  }

  get fileId() {
    return this.payload.file_id;
  }

  get width() {
    return this.payload.width;
  }

  get height() {
    return this.payload.height;
  }

  get fileSize() {
    return this.payload.file_size;
  }

  toString() {
    return this.fileId;
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      fileId: this.fileId,
      width: this.width,
      height: this.height,
      fileSize: this.fileSize,
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = PhotoSize;
