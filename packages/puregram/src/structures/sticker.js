let { inspect } = require('util');

let PhotoSize = require('./photo-size');

class StickerAttachment {
  constructor(payload) {
    this.payload = payload;
  }

  get type() {
    return 'sticker';
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

  get isAnimated() {
    return this.payload.is_animated;
  }

  get thumb() {
    let { thumb } = this.payload;

    return thumb ? new PhotoSize(thumb) : null;
  }

  get emoji() {
    return this.payload.emoji || null;
  }

  get setName() {
    return this.payload.set_name || null;
  }

  get maskPosition() {
    return this.payload.mask_position || null;
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
      isAnimated: this.isAnimated,
      thumb: this.thumb,
      emoji: this.emoji,
      setName: this.setName,
      maskPosition: this.maskPosition,
      fileSize: this.fileSize,
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} <${options.stylize(this.fileId, 'string')}> ${payload}`;
  }
}

module.exports = StickerAttachment;