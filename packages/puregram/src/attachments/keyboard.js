class Keyboard {
  constructor() {
    this.buttons = [];
    this.isResize = false;
    this.isOneTime = false;
    this.isSelective = false;
  }

  get [Symbol.toStringTag]() {
    return 'Keyboard';
  }

  static keyboard(rows) {
    let keyboard = new Keyboard();

    for (let row of rows) {
      keyboard.addRow(row);
    }

    this.buttons = keyboard.buttons;

    return this;
  }

  static resize(resize = true) {
    this.isResize = resize;

    return this;
  }

  static oneTime(oneTime = true) {
    this.isOneTime = oneTime;

    return this;
  }

  static selective(selective = true) {
    this.isSelective = selective;

    return this;
  }

  addRow(row) {
    if (!Array.isArray(row)) {
      row = [row];
    }

    this.buttons.push(row);

    return this;
  }

  static textButton(text) {
    return { text };
  }

  static contactRequestButton(text) {
    return {
      text,
      request_contact: true,
    };
  }

  static locationRequestButton(text) {
    return {
      text,
      request_location: true,
    };
  }

  static toJSON() {
    let { buttons, isResize, isOneTime, isSelective } = this;

    this.buttons = [];
    this.isResize = false;
    this.isOneTime = false;
    this.isSelective = false;

    return JSON.stringify({
      keyboard: buttons,
      resize_keyboard: isResize,
      one_time_keyboard: isOneTime,
      selective: isSelective,
    });
  }
}

module.exports = Keyboard;
