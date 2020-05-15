class InlineKeyboardBuilder {
  constructor() {
    this.rows = [];
    this.currentRow = [];
  }

  get [Symbol.toStringTag]() {
    return 'InlineKeyboardBuilder';
  }

  textButton({
    text,
    payload = {},
  }) {
    if (typeof payload === 'object') {
      payload = JSON.stringify(payload);
    }

    return this.addButton({
      text,
      callback_data: payload,
    });
  }

  urlButton({
    text,
    url,
    payload = {},
  }) {
    if (typeof payload === 'object') {
      payload = JSON.stringify(payload);
    }

    return this.addButton({
      text,
      url,
      callback_data: payload,
    });
  }

  switchToCurrentChatButton({
    text,
    query,
  }) {
    return this.addButton({
      text,
      switch_inline_query_current_chat: query,
    });
  }

  switchToChatButton({
    text,
    query,
  }) {
    return this.addButton({
      text,
      switch_inline_query: query,
    });
  }

  gameButton({
    game,
    text,
  }) {
    return this.addWideButton({
      callback_game: game,
      text,
    });
  }

  payButton(text) {
    return this.addWideButton({
      text,
      pay: true,
    });
  }

  loginButton({
    text,
    loginUrl,
  }) {
    return this.addButton({
      text,
      login_url: loginUrl,
    });
  }

  row() {
    if (this.currentRow.length === 0) {
      return this;
    }

    this.rows.push(this.currentRow);

    this.currentRow = [];

    return this;
  }

  addButton(button) {
    this.currentRow.push(button);

    return this;
  }

  addWideButton(button) {
    if (this.currentRow.length !== 0) {
      this.row();
    }

    this.addButton(button);

    return this.row();
  }

  toJSON() {
    let buttons = this.currentRow.length !== 0
      ? [...this.rows, this.currentRow]
      : this.rows;

    return JSON.stringify({
      inline_keyboard: buttons,
    });
  }
}

module.exports = InlineKeyboardBuilder;
