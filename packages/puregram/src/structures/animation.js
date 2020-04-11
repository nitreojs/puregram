let { inspect } = require('util');

let PhotoSize = require('./photo-size');

class AnimationAttachment {
  constructor(payload) {
    this.payload = payload;
  }

  get type() {
    return 'animation';
  }

  get fileId() {
    return this.payload.file_id;
  }

  get fileUniqueId() {
    return this.payload.file_unique_id;
  }

  get width() {
    return this.payload.width;
  }

  get height() {
    return this.payload.height;
  }

  get duration() {
    return this.payload.duration;
  }

  get thumb() {
    let { thumb } = this.payload;

    return thumb ? new PhotoSize(thumb) : null;
  }

  get fileName() {
    return this.payload.file_name || null;
  }

  get mimeType() {
    return this.payload.mime_type || null;
  }

  get fileSize() {
    return this.payload.file_size || null;
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
      duration: this.duration,
      thumb: this.thumb,
      fileName: this.fileName,
      mimeType: this.mimeType,
      fileSize: this.fileSize,
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} <${options.stylize(this.fileId, 'string')}> ${payload}`;
  }
}

module.exports = AnimationAttachment;
