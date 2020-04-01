let { inspect } = require('util');

let PhotoSize = require('./photo-size');

class VideoNoteAttachment {
  constructor(payload) {
    this.payload = payload;
  }

  get type() {
    return 'video_note';
  }

  get fileId() {
    return this.payload.file_id;
  }

  get length() {
    return this.payload.length;
  }

  get duration() {
    return this.payload.duration;
  }

  get thumb() {
    let { thumb } = this.payload;

    return thumb ? new PhotoSize(thumb) : null;
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
      length: this.length,
      duration: this.duration,
      thumb: this.thumb,
      fileSize: this.fileSize,
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} <${options.stylize(this.fileId, 'string')}> ${payload}`;
  }
}

module.exports = VideoNoteAttachment;
