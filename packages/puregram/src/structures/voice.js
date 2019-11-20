let { inspect } = require('util');

class VoiceAttachment {
  constructor(payload) {
    this.payload = payload;
  }

  get type() {
    return 'voice';
  }

  get fileId() {
    return this.payload.file_id;
  }

  get duration() {
    return this.payload.duration;
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
      duration: this.duration,
      thumb: this.thumb,
      mimeType: this.mimeType,
      fileSize: this.fileSize,
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} <${options.stylize(this.fileId, 'string')}> ${payload}`;
  }
}

module.exports = VoiceAttachment;
