let { inspect } = require('util');

let PhotoSize = require('./photo-size');

class AudioAttachment {
  constructor(payload) {
    this.payload = payload;
  }

  get type() {
    return 'audio';
  }

  get fileId() {
    return this.payload.file_id;
  }

  get duration() {
    return this.payload.duration;
  }

  get performer() {
    return this.payload.performer || null;
  }

  get title() {
    return this.payload.title || null;
  }

  get mimeType() {
    return this.payload.mime_type || null;
  }

  get fileSize() {
    return this.payload.file_size || null;
  }

  get thumb() {
    let { thumb } = this.payload;

    return thumb ? new PhotoSize(thumb) : null;
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      fileId: this.fileId,
      duration: this.duration,
      performer: this.performer,
      title: this.title,
      mimeType: this.mimeType,
      fileSize: this.fileSize,
      thumb: this.thumb,
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} <${options.stylize(this.fileId, 'string')}> ${payload}`;
  }
}

module.exports = AudioAttachment;
