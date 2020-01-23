let { inspect } = require('util');

let PhotoSize = require('./photo-size');

class DocumentAttachment {
  constructor(payload) {
    this.payload = payload;
  }

  get type() {
    return 'document';
  }

  get fileId() {
    return this.payload.file_id;
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

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      fileId: this.fileId,
      thumb: this.thumb,
      fileName: this.fileName,
      mimeType: this.mimeType,
      fileSize: this.fileSize,
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} <${options.stylize(this.fileId, 'string')}> ${payload}`;
  }
}

module.exports = DocumentAttachment;
