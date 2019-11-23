class InlineKeyboard {
  constructor() {
    this.buttons = [];
  }

  get [Symbol.toStringTag]() {
    return 'InlineKeyboard';
  }

  static keyboard(rows) {
    let inlineKeyboard = new InlineKeyboard();

    for (let row of rows) {
      inlineKeyboard.addRow(row);
    }

    return inlineKeyboard;
  }

  static textButton({
    text,
    payload = {},
  }) {
    if (typeof payload === 'object') {
      payload = JSON.stringify(payload);
    }

    return {
      text,
      callback_data: payload,
    };
  }

  static urlButton({
    text,
    url,
    payload = {},
  }) {
    if (typeof payload === 'object') {
      payload = JSON.stringify(payload);
    }

    return {
      text,
      url,
      callback_data: payload,
    };
  }

  static switchToCurrentChatButton({
    text,
    query,
  }) {
    return {
      text,
      switch_inline_query_current_chat: query,
    };
  }

  static switchToChatButton({
    text,
    query,
  }) {
    return {
      text,
      switch_inline_query: query,
    };
  }

  static gameButton({
    game,
    text,
  }) {
    return {
      callback_game: game,
      text,
    };
  }

  static payButton(text) {
    return {
      text,
      pay: true,
    };
  }

  static loginButton({
    text,
    loginUrl,
  }) {
    return {
      text,
      login_url: loginUrl,
    };
  }

  addRow(row) {
    if (!Array.isArray(row)) {
      row = [row];
    }

    this.buttons.push(row);

    return this;
  }

  toJSON() {
    let { buttons } = this;

    return JSON.stringify({
      inline_keyboard: buttons,
    });
  }
}

module.exports = InlineKeyboard;
