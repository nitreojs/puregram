class Context {
  constructor(telegram, type) {
    this.telegram = telegram;
    this.type = type;
  }

  is(types) {
    if (!Array.isArray(types)) {
      types = [types];
    }

    return types.includes(this.type);
  }
}

module.exports = Context;
