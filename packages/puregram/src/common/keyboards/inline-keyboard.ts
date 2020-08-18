import { inspectable } from 'inspectable';

import {
  TelegramInlineKeyboardButton,
  InlineKeyboardTextButton,
  InlineKeyboardUrlButton,
  InlineKeyboardSwitchToCurrentChatButton,
  InlineKeyboardSwitchToChatButton,
  InlineKeyboardGameButton,
  TelegramCallbackGame,
  InlineKeyboardPayButton,
  InlineKeyboardLoginButton,
  TelegramLoginUrl,
  TelegramInlineKeyboardMarkup
} from '../../interfaces';

interface TextButtonParams {
  text: string;

  payload?: Record<string, any> | string;
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

/** Inline keyboard */
export class InlineKeyboard {
  private buttons: TelegramInlineKeyboardButton[][] = [];

  public get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /** Assembles a builder of buttons */
  public static keyboard(
    rows: (TelegramInlineKeyboardButton | TelegramInlineKeyboardButton[])[]
  ): InlineKeyboard {
    const inlineKeyboard = new InlineKeyboard();

    for (const row of rows) {
      inlineKeyboard.addRow(row);
    }

    return inlineKeyboard;
  }

  /** Generates text button */
  public static textButton(params: TextButtonParams): InlineKeyboardTextButton {
    if (typeof params.payload === 'object') {
      params.payload = JSON.stringify(params.payload);
    }

    return {
      text: params.text,
      callback_data: params.payload || ''
    };
  }

  /** Generates URL button */
  public static urlButton(params: UrlButtonParams): InlineKeyboardUrlButton {
    if (typeof params.payload === 'object') {
      params.payload = JSON.stringify(params.payload);
    }

    return {
      text: params.text,
      url: params.url,
      callback_data: params.payload || ''
    };
  }

  /** Generates button that will switch to current chat and type the query */
  public static switchToCurrentChatButton(
    params: SwitchToCurrentChatButtonParams
  ): InlineKeyboardSwitchToCurrentChatButton {
    return {
      text: params.text,
      switch_inline_query_current_chat: params.query
    };
  }

  /** Generates button that will prompt user to select one of their chats */
  public static switchToChatButton(
    params: SwitchToChatButtonParams
  ): InlineKeyboardSwitchToChatButton {
    return {
      text: params.text,
      switch_inline_query: params.query
    };
  }

  /** Generates game button */
  public static gameButton(params: GameButtonParams): InlineKeyboardGameButton {
    return {
      text: params.text,
      callback_game: params.game
    };
  }

  /** Generates pay button */
  public static payButton(params: PayButtonParams): InlineKeyboardPayButton {
    return {
      pay: true,
      text: params.text
    };
  }

  /** Generates login button */
  public static loginButton(params: LoginButtonParams): InlineKeyboardLoginButton {
    return {
      login_url: params.loginUrl,
      text: params.text
    };
  }

  private addRow(row: TelegramInlineKeyboardButton[] | TelegramInlineKeyboardButton): this {
    if (!Array.isArray(row)) row = [row];

    this.buttons.push(row);

    return this;
  }

  public toJSON(): TelegramInlineKeyboardMarkup {
    return {
      inline_keyboard: this.buttons
    };
  }

  public toString(): string {
    return JSON.stringify(this);
  }
}

inspectable(InlineKeyboard, {
  serialize(keyboard: InlineKeyboard) {
    return keyboard.toJSON();
  }
});
