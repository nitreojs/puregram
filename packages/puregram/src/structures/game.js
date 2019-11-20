let { inspect } = require('util');

let PhotoSize = require('./photo-size');
let AnimationAttachment = require('./animation');
let MessageEntity = require('./message-entity');

class Game {
  constructor(payload) {
    this.payload = payload;
  }

  get type() {
    return 'game';
  }

  get title() {
    return this.payload.title;
  }

  get description() {
    return this.payload.description;
  }

  get photo() {
    let { photo } = this.payload;

    if (!photo) return null;

    return photo.map(
      e => new PhotoSize(e),
    );
  }

  get text() {
    return this.payload.text || null;
  }

  get textEntities() {
    let { text_entities } = this.payload;

    if (!text_entities) return null;

    return text_entities.map(
      e => new MessageEntity(e),
    );
  }

  get animation() {
    let { animation } = this.payload;

    return animation ? new AnimationAttachment : null;
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      title: this.title,
      description: this.description,
      photo: this.photo,
      text: this.text,
      textEntities: this.textEntities,
      animation: this.animation,
    };

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = Game;
