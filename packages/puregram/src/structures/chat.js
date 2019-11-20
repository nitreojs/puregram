let { inspect } = require('util');

let { filterPayload } = require('../utils');

class Chat {
  constructor(payload) {
    this.payload = payload;
  }

  get id() {
    return this.payload.id;
  }

  get type() {
    return this.payload.type;
  }

  get title() {
    return this.payload.title || null;
  }

  get username() {
    return this.payload.username || null;
  }

  get firstName() {
    return this.payload.first_name || null;
  }

  get lastName() {
    return this.payload.last_name || null;
  }

  get photo() {
    return this.payload.photo || null;
  }

  get description() {
    return this.payload.description || null;
  }

  get inviteLink() {
    return this.payload.invite_link || null;
  }

  get pinnedMessage() {
    return this.payload.pinned_message || null;
  }

  get permissions() {
    return this.payload.permissions || null;
  }

  get stickerSetName() {
    return this.payload.sticker_set_name || null;
  }

  get canSetStickerSet() {
    return this.payload.can_set_sticker_set || null;
  }

  [inspect.custom](depth, options) {
    let { name } = this.constructor;

    let payloadToInspect = {
      id: this.id,
      type: this.type,
      title: this.title,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      photo: this.photo,
      description: this.description,
      inviteLink: this.inviteLink,
      pinnedMessage: this.pinnedMessage,
      permissions: this.permissions,
      stickerSetName: this.stickerSetName,
      canSetStickerSet: this.canSetStickerSet,
    };

    payloadToInspect = filterPayload(payloadToInspect);

    let payload = inspect(payloadToInspect, { ...options, compact: false });

    return `${options.stylize(name, 'special')} ${payload}`;
  }
}

module.exports = Chat;
