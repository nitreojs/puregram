import { inspectable } from 'inspectable';

import {
  TelegramInlineKeyboardButton,
  TelegramCallbackGame,
  TelegramLoginUrl,
  TelegramInlineKeyboardMarkup
} from '../../telegram-interfaces';

interface TextButtonParams {
  text: string;

  payload: Record<string, any> | string;
}

interface UrlButtonParams {
  text: string;

  url: string;

  payload?: Record<string, any> | string;
}

interface SwitchToCurrentChatButtonParams {
  text: string;

  query: string;
}

interface SwitchToChatButtonParams {
  text: string;

  query: string;
}

interface GameButtonParams {
  text: string;

  game: TelegramCallbackGame;
}

interface PayButtonParams {
  text: string;
}

interface LoginButtonParams {
  text: string;

  loginUrl: TelegramLoginUrl;
}

export class InlineKeyboardBuilder {
  private rows: TelegramInlineKeyboardButton[][] = [];

  private currentRow: TelegramInlineKeyboardButton[] = [];

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** Generates text button */
  public textButton(params: TextButtonParams): this {
    if (typeof params.payload === 'object') {
      params.payload = JSON.stringify(params.payload);
    }

    return this.addButton({
      text: params.text,
      callback_data: params.payload
    });
  }

  /** Generates URL button */
  public urlButton(params: UrlButtonParams): this {
    if (typeof params.payload === 'object') {
      params.payload = JSON.stringify(params.payload);
    }

    return this.addButton({
      text: params.text,
      url: params.url,
      callback_data: params.payload || ''
    });
  }

  /** Generates button that will switch to current chat and type the query */
  public switchToCurrentChatButton(params: SwitchToCurrentChatButtonParams): this {
    return this.addButton({
      text: params.text,
      switch_inline_query_current_chat: params.query
    });
  }

  /** Generates button that will prompt user to select one of their chats */
  public switchToChatButton(params: SwitchToChatButtonParams): this {
    return this.addButton({
      text: params.text,
      switch_inline_query: params.query
    });
  }

  /** Generates game button */
  public gameButton(params: GameButtonParams): this {
    return this.addWideButton({
      text: params.text,
      callback_game: params.game
    });
  }

  /** Generates pay button */
  public payButton(params: PayButtonParams): this {
    return this.addWideButton({
      pay: true,
      text: params.text
    });
  }

  /** Generates login button */
  public loginButton(params: LoginButtonParams): this {
    return this.addButton({
      login_url: params.loginUrl,
      text: params.text
    });
  }

  public row(): this {
    if (this.currentRow.length === 0) {
      return this;
    }

    this.rows.push(this.currentRow);
    this.currentRow = [];

    return this;
  }

  private addButton(button: TelegramInlineKeyboardButton): this {
    this.currentRow.push(button);

    return this;
  }

  private addWideButton(button: TelegramInlineKeyboardButton): this {
    if (this.currentRow.length !== 0) {
      this.row();
    }

    this.addButton(button);

    return this.row();
  }

  public toJSON(): TelegramInlineKeyboardMarkup {
    const buttons = this.currentRow.length !== 0
      ? [...this.rows, this.currentRow]
      : this.rows;

    return {
      inline_keyboard: buttons
    };
  }

  public toString(): string {
    return JSON.stringify(this);
  }
}

inspectable(InlineKeyboardBuilder, {
  serialize(builder: InlineKeyboardBuilder) {
    return builder.toJSON();
  }
});
