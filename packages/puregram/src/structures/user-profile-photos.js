let { inspect } = require('util');

let PhotoAttachment = require('./photo');
let PhotoSize = require('./photo-size');

class UserProfilePhotos {
  constructor(payload) {
    this.payload = payload;
  }

  get totalCount() {
    return this.payload.total_count;
  }

  get photos() {
    return this.payload.photos.map(
      photo => new PhotoAttachment(
        photo.map(
          e => new PhotoSize(e)
        )
      ),
    );
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      totalCount: this.totalCount,
      photos: this.photos,
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = UserProfilePhotos;
