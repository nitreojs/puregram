class RemoveKeyboard {
  constructor() {
    this.isSelective = false;
  }

  static selective(selective = true) {
    this.isSelective = selective;
  }

  static toJSON() {
    let { isSelective } = this;

    this.isSelective = false;

    return JSON.stringify({
      remove_keyboard: true,
      selective: isSelective,
    });
  }
}

module.exports = RemoveKeyboard;
